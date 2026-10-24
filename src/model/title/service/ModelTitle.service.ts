import { inject, injectable } from 'tsyringe'
import { CourseResult } from '../types/ModelTitle.types'

import { CacheService } from '../../../cache/ClearCache'
import { CommonRepository } from '../../../common/repo/common.repo'
import { AppError } from '../../../constant/App.error'
import { CACHE_TTL } from '../../../cache/cache'
import { ModelTitleDTO } from '../controller/ModelTitle.DTO'
import { ModelTitleServiceMethods } from './ModelTitle.serviceInterface'
import { UpdateModelTitleDTO } from '../controller/UpdateModelTitle.DTO'
import { GetPaginationOptions, Status } from '../../../constant/Result.types'
import { ModelTitleRepositoryMethods } from '../repository/ModelTitle.repoInterface'

@injectable()
export class ModelTitleService implements ModelTitleServiceMethods {
    constructor(
        @inject('StudentsCourseRepository')
        private courseRepository: ModelTitleRepositoryMethods,
        @inject('CommonRepository')
        private commonRepository: CommonRepository,

        private readonly clearCache: CacheService
    ) {}

    addCourse = async (data: ModelTitleDTO): Promise<CourseResult> => {
        try {
            const existingTitle =
                await this.commonRepository.existsActiveRecord(
                    'sem_model_title',
                    {
                        name: data.getName(),
                    }
                )

            if (existingTitle) {
                return { status: Status.NAME_ALREADY_EXIST }
            }
            const result = await this.courseRepository.addCourse(data)

            await this.clearCache.delByPattern('modelTitle:')
            return {
                status: Status.SUCCESS,
                courseId: result.insertId,
            }
        } catch (err) {
            console.log(err, 'err')
            if (err instanceof AppError) throw err
            throw new AppError('Failed to add course', 500)
        }
    }

    getAllCourse = async ({
        limit,
        offset,
        all,
        search,
    }: GetPaginationOptions): Promise<CourseResult> => {
        try {
            const safeLimit = limit
            const safeOffset = offset
            let cacheKey = all
                ? `modelTitle:global:all`
                : `modelTitle:global:${safeLimit}:${safeOffset}`
            if (search) cacheKey += `:search:${search}`
            const cached = await this.clearCache.get<CourseResult>(cacheKey)
            if (cached) return cached

            const data = await this.courseRepository.getAllCourse({
                limit,
                offset,
                all,
                search,
            })

            if (!data.courses.length) {
                return {
                    status: Status.NO_NAME_FOUND,
                    course: [],
                    total: 0,
                }
            }

            const courses = data.courses ?? []

            const total = data.total ?? data.courses.length

            const response: CourseResult = {
                status: Status.SUCCESS,
                course: courses,
                total,
            }
            await this.clearCache.set(cacheKey, response, CACHE_TTL)
            return response
        } catch (error) {
            console.log(error, 'error')
            throw new AppError('Failed to fetch course', 500)
        }
    }

    updateCourse = async (data: UpdateModelTitleDTO): Promise<CourseResult> => {
        try {
            const existingCourse =
                await this.commonRepository.existsActiveRecord(
                    'sem_model_title',
                    {
                        id: data.getId(),
                    }
                )

            if (!existingCourse) {
                return { status: Status.NAME_NOT_EXIST }
            }

            const duplicateCourseName =
                await this.commonRepository.findActiveRecord(
                    'sem_model_title',
                    {
                        name: data.getName(),
                        id: Number(data.getId()),
                    }
                )

            if (duplicateCourseName !== null) {
                return { status: Status.NAME_ALREADY_EXIST }
            }

            await this.courseRepository.updateCourse(data)

            await this.clearCache.delByPattern('modelTitle:')

            return { status: Status.SUCCESS } as CourseResult
        } catch (err) {
            console.log(err)
            if (err instanceof AppError) throw err
            throw new AppError('Failed to update course', 500)
        }
    }
}
