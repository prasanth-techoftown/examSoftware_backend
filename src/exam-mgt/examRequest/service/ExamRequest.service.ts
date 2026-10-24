import { injectable, inject } from 'tsyringe'
import { ExamRequestServiceMethods } from './ExamRequest.serviceInterface'
import { ExamRequestRepoMethods } from '../repository/ExamRequest.repoInterface'

import { ExamRequestDTO } from '../controller/ExamRequest.DTO'
import {
    ExamRequestInfo,
    ExamRequestResult,
    ExamStatus,
} from '../types/ExamRequest.types'
import { CacheService } from '../../../cache/ClearCache'
import { CommonRepository } from '../../../common/repo/common.repo'
import { GetPaginationOptions, Status } from '../../../constant/Result.types'
import { AppError } from '../../../constant/App.error'
import { UpdateExamRequestDTO } from '../controller/UpdateExamRequest.DTO'
import { CACHE_TTL } from '../../../cache/cache'
import { RejectLogServiceMethods } from '../../logs/rejectLogs/service/RejectLog.serviceInterface'
import { AppDataSource } from '../../../config/data-source'
import { SchedulingServiceMethods } from '../../scheduling/service/Scheduling.serviceInterface'
import { SchedulingDTO } from '../../scheduling/controller/Scheduling.DTO'

@injectable()
export class ExamRequestService implements ExamRequestServiceMethods {
    constructor(
        @inject('ExamRequestRepository')
        private ExamRequestRepository: ExamRequestRepoMethods,
        @inject('CommonRepository') private commonRepository: CommonRepository,
        @inject('RejectLogService')
        private rejectLogService: RejectLogServiceMethods,
        @inject('SchedulingService')
        private schedulingService: SchedulingServiceMethods,
        private clearCache: CacheService
    ) {}

addExamRequest = async (
    examData: ExamRequestDTO[]
): Promise<ExamRequestResult> => {
    try {
     const studentIds = [...new Set(examData.map((e) => e.getStudentId()))]
const records = await this.ExamRequestRepository.getStudentCourseDetails(studentIds)
const map = new Map(records.map((r) => [Number(r.studentId), { isExternalCourse: Number(r.isExternalCourse) }]))
for (const exam of examData) {
             const details = map.get(Number(exam.getStudentId()))
    if (!details) throw new AppError(`Student not found: ${exam.getStudentId()}`, 400)
            const examDate = exam.getExamDate()

           
            if (
                details.isExternalCourse !== 1 &&
                (examDate === null ||
                    examDate === undefined ||
                    examDate === '')
            ) {
                throw new AppError(
                    'Exam date is required for non-external courses.',
                    400
                )
            }
        }

        const exam = await this.ExamRequestRepository.addExamRequest(
            examData
        )

        await this.clearCache.delByPattern('examRequest')
        await this.clearCache.delByPattern('scheduling')
        await this.clearCache.delByPattern('fees-transaction:')

        return {
            status: Status.SUCCESS,
        }
    } catch (err) {
        console.error(err)

        if (err instanceof AppError) {
            throw err
        }

        throw new AppError('Failed to add examRequestData', 500)
    }
}
    updateExamRequest = async (
        examData: UpdateExamRequestDTO
    ): Promise<ExamRequestResult> => {
        try {
            const request = await this.commonRepository.existsActiveRecord(
                'exam_request',
                { id: examData.getId() }
            )

            if (!request) {
                throw new AppError('Exam request not found', 404)
            }

            if (examData.getStatus() === ExamStatus.REJECTED) {
                const queryRunner = AppDataSource.createQueryRunner()
                await queryRunner.connect()
                await queryRunner.startTransaction()

                try {
                    await this.ExamRequestRepository.updateStatusByAdmissionId(
                        examData,
                        queryRunner
                    )

                    await this.rejectLogService.addRejectLog(
                        examData,
                        queryRunner
                    )

                    await queryRunner.commitTransaction()
                } catch (err) {
                    await queryRunner.rollbackTransaction()
                    throw err
                } finally {
                    await queryRunner.release()
                }

                await this.clearCache.delByPattern('examRequest:')
                await this.clearCache.delByPattern('student')
                await this.clearCache.delByPattern('student_password')

                await this.clearCache.delByPattern('scheduling')
                await this.clearCache.delByPattern('fees-transaction:')

                return { status: Status.SUCCESS }
            }

            if (examData.getStatus() === ExamStatus.APPROVED) {
                const queryRunner = AppDataSource.createQueryRunner()
                await queryRunner.connect()
                await queryRunner.startTransaction()

                try {
                   const student = await this.ExamRequestRepository.getStudentData(examData.getStudentId())
if (!student) throw new AppError('Student not found', 404)

                    const { name: courseName, courseId } = await this.ExamRequestRepository.toFindCourseName(examData.getStudentId())
                    const mappings =
                        await this.ExamRequestRepository.getMappingsByCrmCourseIds(
                            Number(courseId)
                        )
                    if (!mappings || mappings.length === 0) {
                        throw new AppError(
                            'No question mapping found for this course',
                            400
                        )
                    }

                    const questionCourseIds = mappings.map(
                        (m) => m.questionCourseId
                    )

                    const questionCounts =
                        await this.ExamRequestRepository.getQuestionCountsByCourseIds(
                            questionCourseIds
                        )

                    const countMap = new Map<number, number>()
                    questionCounts.forEach((q) => {
                        countMap.set(q.courseId, Number(q.count))
                    })

                    for (const mapping of mappings) {
                        const actualCount =
                            countMap.get(mapping.questionCourseId) || 0

                        if (actualCount < mapping.subjectTotalQuestion) {
                            throw new AppError(
                                `Questions missing for related course. Expected ${mapping.subjectTotalQuestion}`,
                                400
                            )
                        }
                    }
                 await this.ExamRequestRepository.approveWithInsert(student, examData, courseName, queryRunner)


                    const schedulingDto = new SchedulingDTO(
    examData.getExamDate(),
    [{ studentId: examData.getStudentId(), examRequestId: examData.getId() }],
    examData.getUpdatedBy()
)
                    await this.schedulingService.addScheduling(
                        schedulingDto,
                        queryRunner
                    )

                    await queryRunner.commitTransaction()

                    await this.clearCache.delByPattern('examRequest:')
                    await this.clearCache.delByPattern('student:')
                    await this.clearCache.delByPattern('student_password')
                    await this.clearCache.delByPattern('scheduling')
                    await this.clearCache.delByPattern('fees-transaction:')

                    return { status: Status.SUCCESS }
                } catch (err) {
                    await queryRunner.rollbackTransaction()
                    throw err
                } finally {
                    await queryRunner.release()
                }
            }

            throw new AppError('Invalid status', 400)
        } catch (err) {
            console.log(err)

            if (err instanceof AppError) throw err
            throw new AppError('Failed to update exam request', 500)
        }
    }
 getExamRequests = async (
    options: GetPaginationOptions
): Promise<{
    status: Status
    exams: ExamRequestInfo[]
    total: number
}> => {
    try {
        const cacheKey =
            `examRequest:all:${options.search ?? ''}:${options.limit}:${options.offset}`

        const cached = await this.clearCache.get<{
            status: Status
            exams: ExamRequestInfo[]
            total: number
        }>(cacheKey)

        if (cached) return cached

        const data =
            await this.ExamRequestRepository.getAllExamRequests(options)

        const response = {
            status: data.exams.length
                ? Status.SUCCESS
                : Status.NO_NAME_FOUND,
            exams: data.exams,
            total: data.total,
        }

        await this.clearCache.set(cacheKey, response, CACHE_TTL)

        return response
    } catch (err) {
        console.log(err)
        throw new AppError('Failed to fetch examRequestData', 500)
    }
}

    getStudentByStatus = async (
        options: GetPaginationOptions,
        status: string
    ): Promise<ExamRequestResult> => {
        try {
            let cacheKey = options.all
                ? `examRequest:student:all`
                : `examRequest:student:${options.limit}:${options.offset}`

            if (options.search)
                cacheKey += `examRequest:search:${options.search}`
            if (status) cacheKey += `examRequest:status:${status}`

            const cached =
                await this.clearCache.get<ExamRequestResult>(cacheKey)
            if (cached) return cached

            const data = await this.ExamRequestRepository.getStudentByStatus(
                options,
                status
            )

            if (!data.exam.length) {
                return {
                    status: Status.NO_NAME_FOUND,
                    exam: [],
                    total: 0,
                }
            }

            const response: ExamRequestResult = {
                status: Status.SUCCESS,
                exam: data.exam,
                total: data.total,
            }

            await this.clearCache.set(cacheKey, response, CACHE_TTL)

            return response
        } catch (err) {
            console.log(err)
            throw new AppError('Failed to fetch student status', 500)
        }
    }
    getStudentByStatusForBranch = async (
        branchId: string,
        options: { limit?: number; offset?: number; search?: string },
        status: string
    ): Promise<ExamRequestResult> => {
        try {
            let cacheKey = `examRequest:branch:student:${options.limit}:${options.offset}`

            if (options.search) cacheKey += `:search:${options.search}`
            if (status) cacheKey += `:status:${status}`
            if (branchId) cacheKey += `:branchId:${branchId}`

            const result =
                await this.ExamRequestRepository.getStudentByStatusForBranch(
                    branchId,
                    options,
                    status
                )

            if (!result.students.length) {
                return {
                    status: Status.NO_NAME_FOUND,
                    exam: [],
                    total: 0,
                }
            }
            const response: ExamRequestResult = {
                status: Status.SUCCESS,
                exam: result.students,
                total: result.total,
            }

            await this.clearCache.set(cacheKey, response, CACHE_TTL)

            return response
        } catch (error) {
            console.log(error, 'err')

            throw new AppError('Failed to fetch branch students', 500)
        }
    }

    getExamRequestStudentsForBranch = async (
        branchId: string,
        options: { limit?: number; offset?: number; search?: string }
    ): Promise<ExamRequestResult> => {
        try {
            let cacheKey = `examRequest:student:${options.limit}:${options.offset}`

            if (options.search) cacheKey += `:search:${options.search}`
            if (branchId) cacheKey += `:branchId:${branchId}`

            const result =
                await this.ExamRequestRepository.getExamRequestStudentsForBranch(
                    branchId,
                    options
                )
            if (!result.students.length) {
                return {
                    status: Status.NO_NAME_FOUND,
                    exam: [],
                    total: 0,
                }
            }
            const response: ExamRequestResult = {
                status: Status.SUCCESS,
                exam: result.students,
                total: result.total,
            }

            await this.clearCache.set(cacheKey, response, CACHE_TTL)

            return response
        } catch (error) {
            console.log(error, 'err')

            throw new AppError('Failed to fetch branch students', 500)
        }
    }
}
