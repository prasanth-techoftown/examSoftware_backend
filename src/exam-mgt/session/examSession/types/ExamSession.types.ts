import { Result, Status } from '../../../../constant/Result.types'

export enum ExamSessionStatus {
    IN_PROGRESS = 'IN_PROGRESS',
    SUBMITTED = 'SUBMITTED',
    TIMED_OUT = 'TIMED_OUT',
    SUSPENDED = 'SUSPENDED',
}
export enum ExamResultStatus {
    PASSED = 'PASSED',
    ABSENT = 'ABSENT',
    FAILED = 'FAILED',
}
export interface QuestionMapping {
    questionId: number
}

export type ExamSessionInfo = {
    id?: string
    examSessionStatus: ExamSessionStatus
    startedAt: string
    submittedAt: string
    score: string
    totalQuestion: string
    attendedQuestions: string
    studentId: number
    examSchedulingId: number
    createdBy: string
}
export type ResultInfo = {
    examSessionId: number
    score: number
    attendedQuestions: number
    totalQuestion: number
    firstName: string
    lastName: string
    courseName: string
    startedAt: string
    submittedAt: string
    totalTime: number
    result_status?: ExamResultStatus
}
export interface StudentEligibilityResult {
    scheduleId: number
    scheduleStatus: string
    examDate: string

    sessionId: number | null
    sessionStatus: ExamSessionStatus
    startedAt: string | null
    submittedAt: string | null
    remainingSeconds: string

    score: number | null
    totalQuestion: number | null
    attendedQuestions: number | null
    firstName: string
    lastName: string
    courseName: string
}
export enum ExamSessionQuestionStatus {
    TOTAL_MISTAKE = 'The total number of questions does not match the expected count',
    ALREADY_IN_PROGRESS = 'ALREADY_IN_PROGRESS',
}
export interface ExamSessionResult extends Result<
    Status | ExamSessionQuestionStatus
> {
    questions?: ExamSessionInfo[]
    examSessionId?: number
    data?: ResultInfo
    students?: ExamSessionInfo[]
    total?: number
}

export interface ExamSessionTime {
    startedAt: string
    durationMinutes: number
}

export enum EligibilityReason {
    NO_SCHEDULE = 'NO_SCHEDULE',
    SCHEDULE_CANCELLED = 'SCHEDULE_CANCELLED',
    SCHEDULE_ABSENT = 'SCHEDULE_ABSENT',
    ALREADY_COMPLETED = 'ALREADY_COMPLETED',
    RESUME = 'RESUME',
    START = 'START',
    SUSPENDED = 'SUSPENDED',
}

export interface EligibilityResult {
    eligible: boolean
    reason: EligibilityReason
    message: string
    sessionId?: number
    scheduleId?: number
    studentName?: string
    courseName?: string
    result?: {
        sessionId: number
        submittedAt: string
        score: number
        totalQuestion: number
        attendedQuestions: number
        percentage: number
    }
}
