import { CourseDTO } from '../controller/Course.DTO'
import { UpdateCourseDTO } from '../controller/UpdateCourse.DTO'
import { CourseQueryOptions, CourseResult } from '../types/Course.types'

export interface CourseServiceMethods {
    addCourse(data: CourseDTO): Promise<CourseResult>
    updateCourse(data: UpdateCourseDTO): Promise<CourseResult>
    getCourse(options: CourseQueryOptions): Promise<CourseResult>
    deleteCourse(id: number, deletedBy: string): Promise<CourseResult>
}
