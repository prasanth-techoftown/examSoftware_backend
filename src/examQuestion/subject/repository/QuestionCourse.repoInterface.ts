import { ResultSetHeader } from 'mysql2'
import { QuestionCourseDTO } from '../controller/QuestionCourse.DTO'
import { CourseInfo } from '../types/QuestionCourse.types'
import { GetPaginationOptions } from '../../../constant/Result.types'
import { UpdateQuestionCourseDTO } from '../controller/QuestionStudentCourse.DTO'

export interface QuestionCourseRepositoryMethods {
    getAllCourse(
        options: GetPaginationOptions
    ): Promise<{ courses: CourseInfo[]; total: number }>
    addCourse(data: QuestionCourseDTO): Promise<ResultSetHeader>
    updateCourse(data: UpdateQuestionCourseDTO): Promise<ResultSetHeader>
}
