import { ResultSetHeader } from 'mysql2'
import { GetPaginationOptions } from '../../../constant/Result.types'
import {
    ExamRequestInfo,
    ExamRequestInsertedRow,
} from '../types/ExamRequest.types'
import { ExamRequestDTO } from '../controller/ExamRequest.DTO'
import { UpdateExamRequestDTO } from '../controller/UpdateExamRequest.DTO'
import { StudentInfo } from '../../../student/types/Student.types'
import { QueryRunner } from 'typeorm'

export interface ExamRequestRepoMethods {
    addExamRequest(data: ExamRequestDTO[]): Promise<ExamRequestInsertedRow[]>
    getAllExamRequests(options: GetPaginationOptions): Promise<{
        total: number
    exams: ExamRequestInfo[]
    }>
        getStudentCourseDetails  (
    admissionIds: number[]
): Promise<
    {
        studentId: number
        courseId: number
        isExternalCourse: number
    }[]
>
    getStudentByStatus(
        options: GetPaginationOptions,
        status: string
    ): Promise<{
        exam: ExamRequestInfo[]
        total: number
    }>
    updateStatusByAdmissionId(
        data: UpdateExamRequestDTO,
        queryRunner: QueryRunner
    ): Promise<ResultSetHeader>
    getStudentData(admissionId: number): Promise<StudentInfo>
    approveWithInsert(
        admission: StudentInfo,
        data: UpdateExamRequestDTO,
        courseName: string,
        queryRunner: QueryRunner
    ): Promise<void>
    toFindCourseName(
        admissionId: number
    ): Promise<{ name: string; courseId: number }>
    getStudentIdByAdmissionNumber(
        admissionNumber: string,
        queryRunner: QueryRunner
    ): Promise<number>

    getQuestionCountsByCourseIds(
        courseIds: number[]
    ): Promise<{ courseId: number; count: number }[]>
    getMappingsByCrmCourseIds(courseIds: number): Promise<
        {
            crmCourseId: number
            questionCourseId: number
            subjectTotalQuestion: number
        }[]
    >
    getExamRequestStudentsForBranch(
        branchId: string,
        options: { limit?: number; offset?: number; search?: string }
    ): Promise<{ students: ExamRequestInfo[]; total: number }>

    getStudentByStatusForBranch(
        branchId: string,
        options: { limit?: number; offset?: number; search?: string },
        status: string
    ): Promise<{ students: ExamRequestInfo[]; total: number }>
}
