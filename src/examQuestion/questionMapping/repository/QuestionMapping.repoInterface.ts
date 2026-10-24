import { ResultSetHeader } from 'mysql2'
import { GetPaginationOptions } from '../../../constant/Result.types'
import { Course, GroupedCourse } from '../types/QuestionMapping.types'

export interface QuestionMappingRepositoryMethods {
    getQuestionMapping(
        options: GetPaginationOptions
    ): Promise<{ courses: GroupedCourse[]; total: number }>
    addQuestionMapping(
        crmCourseId: number,
        subject: { questionCourseId: number; subjectTotalQuestion: number },
        courseTotalQuestion: number,
        createdBy: string,
        time: number
    ): Promise<ResultSetHeader>
    insertSubject(
        crmCourseId: number,
        subject: { questionCourseId: number; subjectTotalQuestion: number },
        courseTotalQuestion: number,
        updatedBy: string,
        time: number
    ): Promise<ResultSetHeader>
    getSubjectByCourseId(id: number): Promise<{ questionCourseId: number }[]>
    getExistingCrmCourse(): Promise<Course[]>
    updateSubject(
        crmCourseId: number,
        subject: { questionCourseId: number; subjectTotalQuestion: number },
        courseTotalQuestion: number,
        updatedBy: string,
        time: number
    ): Promise<ResultSetHeader>
    deleteSubjects(
        crmCourseId: number,
        questionCourseIds: number[]
    ): Promise<ResultSetHeader>
}
