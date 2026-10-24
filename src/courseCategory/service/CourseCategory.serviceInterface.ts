import { GetPaginationOptions } from '../../../constant/Result.types'
import { CourseCategoryDTO } from '../controller/CourseCategory.DTO'
import { UpdateCourseCategoryDTO } from '../controller/UpdateCourseCategory.DTO'
import { CourseCategoryResult } from '../types/CourseCategory.types'

export interface CourseCategoryServiceMethods {
    addCourseCategory(data: CourseCategoryDTO): Promise<CourseCategoryResult>
    updateCourseCategory(
        data: UpdateCourseCategoryDTO
    ): Promise<CourseCategoryResult>
    getCourseCategory(
        options: GetPaginationOptions
    ): Promise<CourseCategoryResult>
    deleteCourseCategory(
        id: number,
        deletedBy: string
    ): Promise<CourseCategoryResult>
}
