import { inject, injectable } from 'tsyringe'

import { CacheService } from '../../../cache/ClearCache'
import { CommonRepository } from '../../../common/repo/common.repo'
import { AppError } from '../../../constant/App.error'

import { GetPaginationOptions, Status } from '../../../constant/Result.types'

import { CACHE_TTL } from '../../../cache/cache'
import { ModelQuestionMappingRepositoryMethods } from '../repository/ModelQuestionMapping.repoInterface'
import { ModelQuestionMappingServiceMethods } from './ModelQuestionMapping.serviceInterface'
import { ModelQuestionMappingDTO } from '../controller/ModelQuestionMapping.DTO'
import { ModelQuestionMappingResult } from '../types/ModelQuestionMapping.types'
import { UpdateModelQuestionMappingDTO } from '../controller/UpdateModelQuestionMapping.DTO'

@injectable()
export class ModelQuestionMappingService implements ModelQuestionMappingServiceMethods {
    constructor(
        @inject('ModelQuestionMappingRepository')
        private courseRepository: ModelQuestionMappingRepositoryMethods,
        @inject('CommonRepository')
        private commonRepository: CommonRepository,

        private readonly clearCache: CacheService
    ) {}

    addModelQuestionMapping = async (
        data: ModelQuestionMappingDTO
    ): Promise<ModelQuestionMappingResult> => {
        try {
            for (const subject of data.getSubjects()) {
                const duplicateCourse =
                    await this.commonRepository.existsActiveRecord(
                        'sem_model_question_mapping',
                        {
                            titleId: data.getTitleId(),
                            modelSubjectId: subject.modelSubjectId,
                        }
                    )

                if (duplicateCourse)
                    return { status: Status.NAME_ALREADY_EXIST }

                await this.courseRepository.addModelQuestionMapping(
                    data.getTitleId(),
                    subject,
                    data.getCourseTotalQuestion(),
                    data.getCreatedBy(),
                    data.getTime()
                )
            }

            await this.clearCache.delByPattern('modelQuestionMapping:')
            await this.clearCache.delByPattern('modelTitle:')
            await this.clearCache.delByPattern('student:')
            return { status: Status.SUCCESS }
        } catch (err) {
            console.log(err, 'err')
            if (err instanceof AppError) throw err
            throw new AppError('Failed to add course', 500)
        }
    }
    getModelQuestionMapping = async ({
        limit,
        offset,
        all,
        search,
    }: GetPaginationOptions): Promise<ModelQuestionMappingResult> => {
        try {
            const safeLimit = limit
            const safeOffset = offset
            let cacheKey = all
                ? `modelQuestionMapping:global:all`
                : `modelQuestionMapping:global:${safeLimit}:${safeOffset}`
            if (search) cacheKey += `:search:${search}`
            const cached =
                await this.clearCache.get<ModelQuestionMappingResult>(cacheKey)
            if (cached) return cached

            const data = await this.courseRepository.getModelQuestionMapping({
                limit,
                offset,
                all,
                search,
            })

            if (!data.courses.length) {
                return {
                    status: Status.NO_NAME_FOUND,
                    ModelQuestionMapping: [],
                    total: 0,
                }
            }

            const courses = data.courses ?? []

            const total = data.total ?? data.courses.length

            const response: ModelQuestionMappingResult = {
                status: Status.SUCCESS,
                ModelQuestionMapping: courses,
                total,
            }
            await this.clearCache.set(cacheKey, response, CACHE_TTL)
            return response
        } catch (error) {
            console.log(error, 'error')
            throw new AppError('Failed to fetch course', 500)
        }
    }

    updateModelQuestionMapping = async (
        data: UpdateModelQuestionMappingDTO
    ): Promise<ModelQuestionMappingResult> => {
        try {
            const existing = await this.courseRepository.getSubjectByCourseId(
                data.getTitleId()
            )

            const existingIds = existing.map((e) => Number(e.modelSubjectId))

            const incomingIds = data
                .getSubjects()
                .map((s) => Number(s.modelSubjectId))

            const toInsert = data
                .getSubjects()
                .filter((s) => !existingIds.includes(Number(s.modelSubjectId)))

            const toUpdate = data
                .getSubjects()
                .filter((s) => existingIds.includes(Number(s.modelSubjectId)))

            const toDelete = existingIds.filter(
                (id) => !incomingIds.includes(id)
            )

            if (toInsert.length > 0) {
                for (const s of toInsert) {
                    await this.courseRepository.insertSubject(
                        data.getTitleId(),
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
                        data.getTitleId(),
                        s,
                        data.getCourseTotalQuestion(),
                        data.getUpdatedBy(),
                        data.getTime()
                    )
                }
            }

            if (toDelete.length > 0) {
                await this.courseRepository.deleteSubjects(
                    data.getTitleId(),
                    toDelete
                )
            }

            await this.clearCache.delByPattern('modelQuestionMapping:')
            await this.clearCache.delByPattern('modelTitle:')
            await this.clearCache.delByPattern('student:')
            return { status: Status.SUCCESS }
        } catch (err) {
            console.log(err)
            if (err instanceof AppError) throw err
            throw new AppError('Failed to update course', 500)
        }
    }
}
