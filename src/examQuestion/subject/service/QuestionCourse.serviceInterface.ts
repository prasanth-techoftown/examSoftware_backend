import { GetPaginationOptions } from '../../../constant/Result.types'
import { QuestionCourseDTO } from '../controller/QuestionCourse.DTO'
import { UpdateQuestionCourseDTO } from '../controller/QuestionStudentCourse.DTO'
import { CourseResult } from '../types/QuestionCourse.types'

export interface QuestionCourseServiceMethods {
    getAllCourse(options: GetPaginationOptions): Promise<CourseResult>
    addCourse(data: QuestionCourseDTO): Promise<CourseResult>
    updateCourse(data: UpdateQuestionCourseDTO): Promise<CourseResult>
}
