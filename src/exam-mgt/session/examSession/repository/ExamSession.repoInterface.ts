import { QueryRunner } from 'typeorm'
import { StudentInfo } from '../../../../student/types/Student.types'
import {
    ExamSessionInfo,
    ExamSessionStatus,
    ExamSessionTime,
    QuestionMapping,
    ResultInfo,
    StudentEligibilityResult,
} from '../types/ExamSession.types'
import { ExamSessionDTO } from '../controller/ExamSession.DTO'
import { SubmitExamSessionDTO } from '../controller/SubmitExamSession.DTO'
import { ResultSetHeader } from 'mysql2'
import { GetPaginationOptions } from '../../../../constant/Result.types'
import { ExamLogsInfo } from '../../../logs/examLogs/types/ExamLogs.types'

export interface ExamSessionRepositoryMethods {
    startExamForStudent(
        id: string,
        data: ExamSessionDTO,
        remainingSeconds: number | string,
        queryRunner: QueryRunner
    ): Promise<number>
    getExistingSession(sessionId: number): Promise<
        {
            studentId: number
            examSchedulingId: number
            totalQuestion: number
            createdBy: string
        }[]
    >
    getStudentById(studentId: number): Promise<StudentInfo[]>
    getScore(
        examSessionId: number,
        queryRunner?: QueryRunner
    ): Promise<ResultInfo[]>
    getGradeByPercentage(
        percentage: number,
        queryRunner: QueryRunner
    ): Promise<string | null>
    getRandomQuestionsForCourse(courseId: number): Promise<QuestionMapping[]>
    getDurationByCourseId(
        courseId: number
    ): Promise<{ durationMinutes: number } | null>
    updateExamSession(
        data: SubmitExamSessionDTO,
        score: number,
        attemptedCount: number,

        grade: string,
        resultStatus: string,
        percentage: string | number,
        queryRunner: QueryRunner
    ): Promise<ResultSetHeader>
    getStudentByExamStatus({
        limit,
        offset,
        all,
        search,
        date,
    }: GetPaginationOptions): Promise<{
        students: ExamSessionInfo[]
        total: number
    }>
    getExamSessionById(
        examSessionId: number,
        queryRunner: QueryRunner
    ): Promise<{
        examSchedulingId: number
        totalQuestion: number
        studentId: string
        admissionId: string
        branchId: string
        completionDate: string
    } | null>
    getSessionStartAndDuration(
        examStudentId: number
    ): Promise<ExamSessionTime | null>

    checkStudentHasActiveSession(
        studentId: number,
        queryRunner: QueryRunner
    ): Promise<ExamLogsInfo[]>
    checkStudentEligibility(
        studentId: number
    ): Promise<StudentEligibilityResult>
    deleteAnswerLogs(
        sessionId: number,
        manager: QueryRunner
    ): Promise<ResultSetHeader>
    deleteSession(
        sessionId: number,
        manager: QueryRunner
    ): Promise<ResultSetHeader>
    deleteSessionQuestionLogs(
        sessionId: number,
        manager: QueryRunner
    ): Promise<ResultSetHeader>
    updateStudentExamStatus(
        sessionId: number,
        status: ExamSessionStatus
    ): Promise<ResultSetHeader>
    getSuspendedStudents({
        limit,
        offset,
        search,
    }: GetPaginationOptions): Promise<{
        students: ExamSessionInfo[]
        total: number
    }>
    allowReAttempt: (sessionId: number) => Promise<ResultSetHeader>
}
