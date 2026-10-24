import { inject, injectable } from 'tsyringe'
import { CourseResult } from '../types/ModelSubject.types'

import { CacheService } from '../../../cache/ClearCache'
import { CommonRepository } from '../../../common/repo/common.repo'
import { AppError } from '../../../constant/App.error'
import { CACHE_TTL } from '../../../cache/cache'
import { ModelSubjectDTO } from '../controller/ModelSubject.DTO'
import { ModelSubjectServiceMethods } from './ModelSubject.serviceInterface'
import { GetPaginationOptions, Status } from '../../../constant/Result.types'
import { ModelSubjectRepositoryMethods } from '../repository/ModelSubject.repoInterface'
import { UpdateModelSubjectDTO } from '../controller/UpdateModelSubject.DTO'

@injectable()
export class ModelSubjectService implements ModelSubjectServiceMethods {
    constructor(
        @inject('ModelSubjectRepository')
        private courseRepository: ModelSubjectRepositoryMethods,
        @inject('CommonRepository')
        private commonRepository: CommonRepository,

        private readonly clearCache: CacheService
    ) {}

    addCourse = async (data: ModelSubjectDTO): Promise<CourseResult> => {
        const duplicateCourseName =
            await this.commonRepository.existsActiveRecord(
                'sem_model_subject',
                {
                    name: data.getName(),
                }
            )

        if (duplicateCourseName) return { status: Status.NAME_ALREADY_EXIST }

        try {
            const result = await this.courseRepository.addCourse(data)

            await this.clearCache.delByPattern('modelSubject:')
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
                ? `modelSubject:global:all`
                : `modelSubject:global:${safeLimit}:${safeOffset}`
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

    updateCourse = async (
        data: UpdateModelSubjectDTO
    ): Promise<CourseResult> => {
        try {
            const existingCourse =
                await this.commonRepository.existsActiveRecord(
                    'sem_model_subject',
                    {
                        id: data.getId(),
                    }
                )

            if (!existingCourse) {
                return { status: Status.NAME_NOT_EXIST }
            }

            const duplicateCourseName =
                await this.commonRepository.findActiveRecord(
                    'sem_model_subject',
                    {
                        name: data.getName(),
                        id: Number(data.getId()),
                    }
                )

            if (duplicateCourseName !== null) {
                return { status: Status.NAME_ALREADY_EXIST }
            }

            await this.courseRepository.updateCourse(data)

            await this.clearCache.delByPattern('modelSubject:')

            return { status: Status.SUCCESS } as CourseResult
        } catch (err) {
            console.log(err)
            if (err instanceof AppError) throw err
            throw new AppError('Failed to update course', 500)
        }
    }
}
