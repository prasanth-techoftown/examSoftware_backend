import { ResultSetHeader } from 'mysql2'
import { GetPaginationOptions } from '../../../constant/Result.types'
import { GroupedCourse } from '../types/ModelQuestionMapping.types'

export interface ModelQuestionMappingRepositoryMethods {
    getModelQuestionMapping(
        options: GetPaginationOptions
    ): Promise<{ courses: GroupedCourse[]; total: number }>
    addModelQuestionMapping(
        crmCourseId: number,
        subject: { modelSubjectId: number; subjectTotalQuestion: number },
        courseTotalQuestion: number,
        createdBy: string,
        time: number
    ): Promise<ResultSetHeader>
    insertSubject(
        crmCourseId: number,
        subject: { modelSubjectId: number; subjectTotalQuestion: number },
        courseTotalQuestion: number,
        updatedBy: string,
        time: number
    ): Promise<ResultSetHeader>
    getSubjectByCourseId(id: number): Promise<{ modelSubjectId: number }[]>

    updateSubject(
        crmCourseId: number,
        subject: { modelSubjectId: number; subjectTotalQuestion: number },
        courseTotalQuestion: number,
        updatedBy: string,
        time: number
    ): Promise<ResultSetHeader>
    deleteSubjects(
        crmCourseId: number,
        modelSubjectIds: number[]
    ): Promise<ResultSetHeader>
}
