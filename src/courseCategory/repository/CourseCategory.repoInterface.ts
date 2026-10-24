import { ResultSetHeader } from 'mysql2'
import { CourseCategoryDTO } from '../controller/CourseCategory.DTO'
import { UpdateCourseCategoryDTO } from '../controller/UpdateCourseCategory.DTO'
import { CourseCategoryInfo } from '../types/CourseCategory.types'
import { GetPaginationOptions } from '../../constant/Result.types'

export interface CourseCategoryRepositoryMethods {
    addCourseCategory(data: CourseCategoryDTO): Promise<ResultSetHeader>
    updateCourseCategory(data: UpdateCourseCategoryDTO): Promise<ResultSetHeader>
    getCourseCategory(options: GetPaginationOptions): Promise<{
        courseCategory: CourseCategoryInfo[]
        total?: number
    }>
    countActiveCourses(categoryId: number): Promise<number>
    deleteCourseCategory(id: number, deletedBy: string): Promise<ResultSetHeader>
}
