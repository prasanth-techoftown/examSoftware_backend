import { inject, injectable } from 'tsyringe'
import { SchedulingResult } from '../types/Scheduling.types'

import { CacheService } from '../../../cache/ClearCache'
import { AppError } from '../../../constant/App.error'
import { CACHE_TTL } from '../../../cache/cache'
import { GetPaginationOptions, Status } from '../../../constant/Result.types'
import { SchedulingServiceMethods } from './Scheduling.serviceInterface'
import { SchedulingRepositoryMethods } from '../repository/Scheduling.repoInterface'
import { SchedulingDTO } from '../controller/Scheduling.DTO'
import { StudentLoginServiceMethods } from '../../../security/studentLogin/service/StudentLogin.serviceInterface'
import { StudentLoginDTO } from '../../../security/studentLogin/controller/StudentLogin.DTO'
import { CommonRepository } from '../../../common/repo/common.repo'
import { QueryRunner } from 'typeorm'
import { RandomPassword } from '../../../utils/RandomPassword'
@injectable()
export class SchedulingService implements SchedulingServiceMethods {
    constructor(
        @inject('SchedulingRepository')
        private schedulingRepository: SchedulingRepositoryMethods,

        @inject('StudentLoginService')
        private studentLoginService: StudentLoginServiceMethods,

        @inject('CommonRepository')
        private commonRepository: CommonRepository,

        private readonly clearCache: CacheService
    ) {}

    addScheduling = async (
        data: SchedulingDTO,
        queryRunner: QueryRunner
    ): Promise<SchedulingResult> => {
        try {
            const skippedStudents: number[] = []

            for (const item of data.getSelected()) {
                const studentId = item.studentId
                const examRequestId = item.examRequestId
                const lastSchedule =
                    await this.schedulingRepository.getLatestSchedulingStatus(
                        studentId,
                        queryRunner
                    )

                if (lastSchedule.length > 0) {
                    const status = lastSchedule[0].status

                    if (status !== 'COMPLETED' && status !== 'ABSENT') {
                        skippedStudents.push(studentId)
                        continue
                    }
                }

                await this.schedulingRepository.addScheduling(
                    data.getExamDate(),
                    studentId,
                    examRequestId,
                    data.getCreatedBy(),
                    queryRunner
                )

                const student = await this.schedulingRepository.getStudentById(
                    studentId,
                    queryRunner
                )

                if (!student || student.length === 0) {
                    skippedStudents.push(studentId)
                    continue
                }

                const studentData = student[0]

                const password = RandomPassword(6)

                const studentLoginDto = new StudentLoginDTO(
                    studentData.admissionNumber,
                    password,
                    Number(studentData.id),
                    data.getCreatedBy()
                )

                const exists = await this.commonRepository.existsActiveRecord(
                    'sem_studentLogin',
                    { studentId }
                )

                if (!exists) {
                    await this.studentLoginService.addStudentForLogin(
                        studentLoginDto,
                        queryRunner
                    )
                } else {
                    await this.studentLoginService.updateStudentPassword(
                        studentId,
                        password,
                        queryRunner
                    )
                }
            }

            await this.clearCache.delByPattern('scheduling:')
            await this.clearCache.delByPattern('examSession:')
            await this.clearCache.delByPattern('student')

            return {
                status: Status.SUCCESS,
            }
        } catch (err) {
            console.log(err, 'err')
            if (err instanceof AppError) throw err
            throw new AppError('Failed to add scheduling', 500)
        }
    }

    getAllScheduling = async (
        { limit, offset, all, search }: GetPaginationOptions,
        status: string
    ): Promise<SchedulingResult> => {
        try {
            const safeLimit = limit
            const safeOffset = offset

            const cacheKey = [
                'scheduling',
                'global',
                all ? 'all' : `${safeLimit}:${safeOffset}`,
                search ? `search:${encodeURIComponent(search)}` : null,
                status ? `status:${status}` : null,
            ]
                .filter(Boolean)
                .join(':')
            const cached = await this.clearCache.get<SchedulingResult>(cacheKey)
            if (cached) return cached

            const data = await this.schedulingRepository.getAllScheduling(
                { limit, offset, all, search },
                status
            )

            if (!data.scheduling.length) {
                return {
                    status: Status.NO_NAME_FOUND,
                    examSchedule: [],
                    total: 0,
                }
            }

            const response: SchedulingResult = {
                status: Status.SUCCESS,
                examSchedule: data.scheduling,
                total: data.total,
            }

            await this.clearCache.set(cacheKey, response, CACHE_TTL)

            return response
        } catch (error) {
            console.log(error, 'error')
            throw new AppError('Failed to fetch scheduling', 500)
        }
    }
}
