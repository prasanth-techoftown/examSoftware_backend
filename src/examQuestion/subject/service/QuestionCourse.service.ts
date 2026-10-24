import { inject, injectable } from 'tsyringe'
import { CourseResult } from '../types/QuestionCourse.types'

import { CacheService } from '../../../cache/ClearCache'
import { CommonRepository } from '../../../common/repo/common.repo'
import { AppError } from '../../../constant/App.error'
import { CACHE_TTL } from '../../../cache/cache'
import { QuestionCourseDTO } from '../controller/QuestionCourse.DTO'
import { QuestionCourseServiceMethods } from './QuestionCourse.serviceInterface'
import { GetPaginationOptions, Status } from '../../../constant/Result.types'
import { QuestionCourseRepositoryMethods } from '../repository/QuestionCourse.repoInterface'
import { UpdateQuestionCourseDTO } from '../controller/QuestionStudentCourse.DTO'

@injectable()
export class QuestionCourseService implements QuestionCourseServiceMethods {
    constructor(
        @inject('QuestionCourseRepository')
        private courseRepository: QuestionCourseRepositoryMethods,
        @inject('CommonRepository')
        private commonRepository: CommonRepository,

        private readonly clearCache: CacheService
    ) {}

    addCourse = async (data: QuestionCourseDTO): Promise<CourseResult> => {
        const duplicateCourseName =
            await this.commonRepository.existsActiveRecord(
                'sem_questioncourse',
                {
                    name: data.getName(),
                }
            )

        if (duplicateCourseName) return { status: Status.NAME_ALREADY_EXIST }

        try {
            const result = await this.courseRepository.addCourse(data)

            await this.clearCache.delByPattern('course:')
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
                ? `course:question-global:all`
                : `course:question-global:${safeLimit}:${safeOffset}`
            if (search) cacheKey += `course:question-search:${search}`
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
        data: UpdateQuestionCourseDTO
    ): Promise<CourseResult> => {
        try {
            const existingCourse =
                await this.commonRepository.existsActiveRecord(
                    'sem_questioncourse',
                    {
                        id: data.getId(),
                    }
                )

            if (!existingCourse) {
                return { status: Status.NAME_NOT_EXIST }
            }

            const duplicateCourseName =
                await this.commonRepository.findActiveRecord(
                    'sem_questioncourse',
                    {
                        name: data.getName(),
                        id: Number(data.getId()),
                    }
                )

            if (duplicateCourseName !== null) {
                return { status: Status.NAME_ALREADY_EXIST }
            }

            await this.courseRepository.updateCourse(data)

            await this.clearCache.delByPattern('course:')

            return { status: Status.SUCCESS } as CourseResult
        } catch (err) {
            console.log(err)
            if (err instanceof AppError) throw err
            throw new AppError('Failed to update course', 500)
        }
    }
}
