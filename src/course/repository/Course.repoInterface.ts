import { ResultSetHeader } from 'mysql2'
import { CourseDTO } from '../controller/Course.DTO'
import { UpdateCourseDTO } from '../controller/UpdateCourse.DTO'
import { CourseInfo, CourseQueryOptions } from '../types/Course.types'

export interface CourseRepositoryMethods {
    addCourse(data: CourseDTO): Promise<ResultSetHeader>
    updateCourse(data: UpdateCourseDTO): Promise<ResultSetHeader>
    getCourse(
        options: CourseQueryOptions
    ): Promise<{ Course: CourseInfo[]; total?: number }>
    deleteCourse(id: number, deletedBy: string): Promise<ResultSetHeader>
}
