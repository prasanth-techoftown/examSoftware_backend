import { inject, injectable } from 'tsyringe'

import { CourseDTO } from '../controller/Course.DTO'
import { UpdateCourseDTO } from '../controller/UpdateCourse.DTO'
import { CourseRepositoryMethods } from '../repository/Course.repoInterface'
import {
    CourseQueryOptions,
    CourseResult,
    CourseStatus,
} from '../types/Course.types'
import { CourseServiceMethods } from './Course.serviceInterface'
import { CACHE_TTL } from '../../cache/cache'
import { CacheService } from '../../cache/ClearCache'
import { CommonRepository } from '../../common/repo/common.repo'
import { AppError } from '../../constant/App.error'
import { Status } from '../../constant/Result.types'

const TABLE = 'sem_course'
const CATEGORY_TABLE = 'sem_coursecategory'
const CACHE_PREFIX = 'emcaCourse:'

@injectable()
export class CourseService implements CourseServiceMethods {
    constructor(
        @inject('CourseRepository') private repo: CourseRepositoryMethods,
        @inject('CommonRepository') private commonRepository: CommonRepository,
        private clearCache: CacheService
    ) {}

    addCourse = async (data: CourseDTO): Promise<CourseResult> => {
        try {
            const categoryOk = await this.commonRepository.existsActiveRecord(
                CATEGORY_TABLE,
                { id: data.getCourseCategoryId() }
            )
            if (!categoryOk) return { status: CourseStatus.CATEGORY_NOT_EXIST }

            if (
                await this.commonRepository.existsActiveRecord(TABLE, {
                    name: data.getName(),
                })
            ) {
                return { status: Status.NAME_ALREADY_EXIST }
            }
            if (
                await this.commonRepository.existsActiveRecord(TABLE, {
                    courseCode: data.getCourseCode(),
                })
            ) {
                return { status: CourseStatus.CODE_ALREADY_EXIST }
            }

            await this.repo.addCourse(data)
            await this.clearCache.delByPattern(CACHE_PREFIX)
            return { status: Status.SUCCESS }
        } catch (err) {
            if (err instanceof AppError) throw err
            throw new AppError('Failed to add course', 500)
        }
    }

    updateCourse = async (data: UpdateCourseDTO): Promise<CourseResult> => {
        try {
            if (
                !(await this.commonRepository.existsActiveRecord(TABLE, {
                    id: data.getId(),
                }))
            ) {
                return { status: Status.NAME_NOT_EXIST }
            }
            if (
                !(await this.commonRepository.existsActiveRecord(
                    CATEGORY_TABLE,
                    { id: data.getCourseCategoryId() }
                ))
            ) {
                return { status: CourseStatus.CATEGORY_NOT_EXIST }
            }

            // findActiveRecord treats `id` as "id != ?" -> duplicate on another row
            if (
                (await this.commonRepository.findActiveRecord(TABLE, {
                    name: data.getName(),
                    id: data.getId(),
                })) !== null
            ) {
                return { status: Status.NAME_ALREADY_EXIST }
            }
            if (
                (await this.commonRepository.findActiveRecord(TABLE, {
                    courseCode: data.getCourseCode(),
                    id: data.getId(),
                })) !== null
            ) {
                return { status: CourseStatus.CODE_ALREADY_EXIST }
            }

            await this.repo.updateCourse(data)
            await this.clearCache.delByPattern(CACHE_PREFIX)
            return { status: Status.SUCCESS }
        } catch (err) {
            if (err instanceof AppError) throw err
            throw new AppError('Failed to update course', 500)
        }
    }

    getCourse = async (options: CourseQueryOptions): Promise<CourseResult> => {
        try {
            const { limit, offset, all, search, courseCategoryId } = options
            const cacheKey = [
                CACHE_PREFIX,
                all ? 'ALL' : `PAGE:${limit}:${offset}`,
                courseCategoryId ? `cat:${courseCategoryId}` : '',
                search ? `search:${encodeURIComponent(search)}` : '',
            ].join(':')

            const cached = await this.clearCache.get<CourseResult>(cacheKey)
            if (cached) return cached

            const data = await this.repo.getCourse(options)
            if (!data.Course.length) {
                return { status: Status.NO_NAME_FOUND, Course: [], total: 0 }
            }

            const response: CourseResult = {
                status: Status.SUCCESS,
                Course: data.Course,
                total: data.total ?? data.Course.length,
            }
            await this.clearCache.set(cacheKey, response, CACHE_TTL)
            return response
        } catch (err) {
            console.log(err, 'Failed to fetch courses')
            throw new AppError('Failed to fetch courses', 500)
        }
    }

    deleteCourse = async (
        id: number,
        deletedBy: string
    ): Promise<CourseResult> => {
        try {
            if (
                !(await this.commonRepository.existsActiveRecord(TABLE, { id }))
            ) {
                return { status: Status.NAME_NOT_EXIST }
            }
            await this.repo.deleteCourse(id, deletedBy)
            await this.clearCache.delByPattern(CACHE_PREFIX)
            return { status: Status.SUCCESS }
        } catch (err) {
            if (err instanceof AppError) throw err
            throw new AppError('Failed to delete course', 500)
        }
    }
}
