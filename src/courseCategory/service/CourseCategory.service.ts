import { inject, injectable } from 'tsyringe'

import { CourseCategoryDTO } from '../controller/CourseCategory.DTO'
import { UpdateCourseCategoryDTO } from '../controller/UpdateCourseCategory.DTO'
import { CourseCategoryRepositoryMethods } from '../repository/CourseCategory.repoInterface'
import {
    CourseCategoryResult,
    CourseCategoryStatus,
} from '../types/CourseCategory.types'
import { CourseCategoryServiceMethods } from './CourseCategory.serviceInterface'
import { CACHE_TTL } from '../../cache/cache'
import { CacheService } from '../../cache/ClearCache'
import { CommonRepository } from '../../common/repo/common.repo'
import { AppError } from '../../constant/App.error'
import { Status, GetPaginationOptions } from '../../constant/Result.types'

const TABLE = 'sem_coursecategory'
const CACHE_PREFIX = 'courseCategory:'

@injectable()
export class CourseCategoryService implements CourseCategoryServiceMethods {
    constructor(
        @inject('CourseCategoryRepository')
        private repo: CourseCategoryRepositoryMethods,
        @inject('CommonRepository') private commonRepository: CommonRepository,
        private clearCache: CacheService
    ) {}

    // course list screens read categories too, so clear both prefixes
    private clearAll = async () => {
        await this.clearCache.delByPattern(CACHE_PREFIX)
        await this.clearCache.delByPattern('emcaCourse:')
    }

    addCourseCategory = async (
        data: CourseCategoryDTO
    ): Promise<CourseCategoryResult> => {
        try {
            const exists = await this.commonRepository.existsActiveRecord(
                TABLE,
                { name: data.getName() }
            )
            if (exists) return { status: Status.NAME_ALREADY_EXIST }

            await this.repo.addCourseCategory(data)
            await this.clearAll()
            return { status: Status.SUCCESS }
        } catch (err) {
            if (err instanceof AppError) throw err
            throw new AppError('Failed to add course category', 500)
        }
    }

    updateCourseCategory = async (
        data: UpdateCourseCategoryDTO
    ): Promise<CourseCategoryResult> => {
        try {
            const exists = await this.commonRepository.existsActiveRecord(
                TABLE,
                { id: data.getId() }
            )
            if (!exists) return { status: Status.NAME_NOT_EXIST }

            // findActiveRecord treats `id` as "id != ?", i.e. duplicate-name check
            const duplicate = await this.commonRepository.findActiveRecord(
                TABLE,
                { name: data.getName(), id: data.getId() }
            )
            if (duplicate !== null) return { status: Status.NAME_ALREADY_EXIST }

            await this.repo.updateCourseCategory(data)
            await this.clearAll()
            return { status: Status.SUCCESS }
        } catch (err) {
            if (err instanceof AppError) throw err
            throw new AppError('Failed to update course category', 500)
        }
    }

    getCourseCategory = async ({
        limit,
        offset,
        all,
    }: GetPaginationOptions): Promise<CourseCategoryResult> => {
        try {
            const cacheKey = all
                ? `${CACHE_PREFIX}all`
                : `${CACHE_PREFIX}page:${limit}:${offset}`

            const cached =
                await this.clearCache.get<CourseCategoryResult>(cacheKey)
            if (cached) return cached

            const data = await this.repo.getCourseCategory({
                limit,
                offset,
                all,
            })

            if (!data.courseCategory.length) {
                return {
                    status: Status.NO_NAME_FOUND,
                    courseCategory: [],
                    total: 0,
                }
            }

            const response: CourseCategoryResult = {
                status: Status.SUCCESS,
                courseCategory: data.courseCategory,
                total: data.total ?? data.courseCategory.length,
            }
            await this.clearCache.set(cacheKey, response, CACHE_TTL)
            return response
        } catch (err) {
            console.log(err, 'Failed to fetch course categories')
            throw new AppError('Failed to fetch course categories', 500)
        }
    }

    deleteCourseCategory = async (
        id: number,
        deletedBy: string
    ): Promise<CourseCategoryResult> => {
        try {
            const exists = await this.commonRepository.existsActiveRecord(
                TABLE,
                { id }
            )
            if (!exists) return { status: Status.NAME_NOT_EXIST }

            const used = await this.repo.countActiveCourses(id)
            if (used > 0) return { status: CourseCategoryStatus.IN_USE }

            await this.repo.deleteCourseCategory(id, deletedBy)
            await this.clearAll()
            return { status: Status.SUCCESS }
        } catch (err) {
            if (err instanceof AppError) throw err
            throw new AppError('Failed to delete course category', 500)
        }
    }
}
