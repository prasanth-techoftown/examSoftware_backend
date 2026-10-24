import { SubmitExamSessionDTO } from '../controller/SubmitExamSession.DTO'
import { ExamSessionDTO } from '../controller/ExamSession.DTO'
import {
    EligibilityResult,
    ExamSessionResult,
    ExamSessionStatus,
} from '../types/ExamSession.types'
import { GetPaginationOptions } from '../../../../constant/Result.types'

export interface ExamSessionServiceMethods {
    startExamForStudent(
        examSessionDTO: ExamSessionDTO
    ): Promise<ExamSessionResult>
    getSessionStartAndDuration(examStudentId: number): Promise<number>
    getScore(examSessionId: number): Promise<ExamSessionResult>
    submitExamSession(data: SubmitExamSessionDTO): Promise<ExamSessionResult>
    checkStudentEligibility(studentId: number): Promise<EligibilityResult>
    getStudentByExamStatus({
        limit,
        offset,
        all,
        search,
        date,
    }: GetPaginationOptions): Promise<ExamSessionResult>
    updateStudentExamStatus(
        sessionId: number,
        status: ExamSessionStatus
    ): Promise<{ success: boolean; message: string }>
    getSuspendedStudents({
        all,
        limit,
        offset,
        search,
    }: GetPaginationOptions): Promise<ExamSessionResult>
    allowReAttempt: (
        sessionId: number
    ) => Promise<{ success: boolean; message: string }>
    allowResetSession: (
        sessionId: number
    ) => Promise<{ success: boolean; message: string }>
}
