import { inject, injectable } from 'tsyringe'

import { CacheService } from '../../../cache/ClearCache'
import { CommonRepository } from '../../../common/repo/common.repo'
import { AppError } from '../../../constant/App.error'
import { QuestionMappingDTO } from '../controller/QuestionMapping.DTO'
import { QuestionMappingServiceMethods } from './QuestionMapping.serviceInterface'
import { GetPaginationOptions, Status } from '../../../constant/Result.types'
import { QuestionMappingRepositoryMethods } from '../repository/QuestionMapping.repoInterface'
import { QuestionMappingResult } from '../types/QuestionMapping.types'
import { CACHE_TTL } from '../../../cache/cache'
import { UpdateQuestionMappingDTO } from '../controller/UpdateQuestionMapping.DTO'

@injectable()
export class QuestionMappingService implements QuestionMappingServiceMethods {
    constructor(
        @inject('QuestionMappingRepository')
        private courseRepository: QuestionMappingRepositoryMethods,
        @inject('CommonRepository')
        private commonRepository: CommonRepository,

        private readonly clearCache: CacheService
    ) {}

    addQuestionMapping = async (
        data: QuestionMappingDTO
    ): Promise<QuestionMappingResult> => {
        try {
            for (const subject of data.getSubjects()) {
                const duplicateCourse =
                    await this.commonRepository.existsActiveRecord(
                        'sem_question_mapping',
                        {
                            crmCourseId: data.getCrmCourseId(),
                            questionCourseId: subject.questionCourseId,
                        }
                    )

                if (duplicateCourse)
                    return { status: Status.NAME_ALREADY_EXIST }

                await this.courseRepository.addQuestionMapping(
                    data.getCrmCourseId(),
                    subject,
                    data.getCourseTotalQuestion(),
                    data.getCreatedBy(),
                    data.getTime()
                )
            }

            await this.clearCache.delByPattern('courseExamMark:')
            await this.clearCache.delByPattern('student:')
            await this.clearCache.delByPattern('course:')
            await this.clearCache.delByPattern('crmCourseId:')

            return { status: Status.SUCCESS }
        } catch (err) {
            console.log(err, 'err')
            if (err instanceof AppError) throw err
            throw new AppError('Failed to add course', 500)
        }
    }
    getQuestionMapping = async ({
        limit,
        offset,
        all,
        search,
    }: GetPaginationOptions): Promise<QuestionMappingResult> => {
        try {
            const safeLimit = limit
            const safeOffset = offset
            let cacheKey = all
                ? `courseExamMark:global:all`
                : `courseExamMark:global:${safeLimit}:${safeOffset}`
            if (search) cacheKey += `:search:${search}`
            const cached =
                await this.clearCache.get<QuestionMappingResult>(cacheKey)
            if (cached) return cached

            const data = await this.courseRepository.getQuestionMapping({
                limit,
                offset,
                all,
                search,
            })

            if (!data.courses.length) {
                return {
                    status: Status.NO_NAME_FOUND,
                    questionMapping: [],
                    total: 0,
                }
            }

            const courses = data.courses ?? []

            const total = data.total ?? 0

            const response: QuestionMappingResult = {
                status: Status.SUCCESS,
                questionMapping: courses,
                total,
            }
            await this.clearCache.set(cacheKey, response, CACHE_TTL)
            return response
        } catch (error) {
            console.log(error, 'error')
            throw new AppError('Failed to fetch course', 500)
        }
    }

    getExistingCrmCourse = async (): Promise<QuestionMappingResult> => {
        try {
            let cacheKey = `crmCourseId:all`

            const cached =
                await this.clearCache.get<QuestionMappingResult>(cacheKey)
            if (cached) return cached

            const data = await this.courseRepository.getExistingCrmCourse()

            if (!data) {
                return {
                    status: Status.NO_NAME_FOUND,
                    course: [],
                    total: 0,
                }
            }

            const courses = data.map((row) => row)

            const response: QuestionMappingResult = {
                status: Status.SUCCESS,
                course: courses,
            }
            await this.clearCache.set(cacheKey, response, CACHE_TTL)
            return response
        } catch (error) {
            console.log(error, 'error')
            throw new AppError('Failed to fetch course', 500)
        }
    }

    updateQuestionMapping = async (
        data: UpdateQuestionMappingDTO
    ): Promise<QuestionMappingResult> => {
        try {
            const existing = await this.courseRepository.getSubjectByCourseId(
                data.getCrmCourseId()
            )

            const existingIds = existing.map((e) => Number(e.questionCourseId))

            const incomingIds = data
                .getSubjects()
                .map((s) => Number(s.questionCourseId))

            const toInsert = data
                .getSubjects()
                .filter(
                    (s) => !existingIds.includes(Number(s.questionCourseId))
                )

            const toUpdate = data
                .getSubjects()
                .filter((s) => existingIds.includes(Number(s.questionCourseId)))

            const toDelete = existingIds.filter(
                (id) => !incomingIds.includes(id)
            )

            if (toInsert.length > 0) {
                for (const s of toInsert) {
                    await this.courseRepository.insertSubject(
                        data.getCrmCourseId(),
                        s,
                        data.getCourseTotalQuestion(),
                        data.getUpdatedBy(),
                        data.getTime()
                    )
                }
            }
            if (toUpdate.length > 0) {
                for (const s of toUpdate) {
                    await this.courseRepository.updateSubject(
                        data.getCrmCourseId(),
                        s,
                        data.getCourseTotalQuestion(),
                        data.getUpdatedBy(),
                        data.getTime()
                    )
                }
            }

            if (toDelete.length > 0) {
                await this.courseRepository.deleteSubjects(
                    data.getCrmCourseId(),
                    toDelete
                )
            }

            await this.clearCache.delByPattern('courseExamMark:')
            await this.clearCache.delByPattern('student:')
            await this.clearCache.delByPattern('course:')
            await this.clearCache.delByPattern('crmCourseId:')

            return { status: Status.SUCCESS }
        } catch (err) {
            console.log(err)
            if (err instanceof AppError) throw err
            throw new AppError('Failed to update course', 500)
        }
    }
}
