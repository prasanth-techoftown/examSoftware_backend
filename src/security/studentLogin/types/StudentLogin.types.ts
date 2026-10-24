import { Result, Status } from '../../../constant/Result.types'

export type ExamSchedule = {
    id: number
    examDate: string
    status: string
    exam_session_status: string
}

export type StudentLoginInfo = {
    userName: string
    password: string
    studentId: number
    createdBy?: string
}

export enum StudentLoginStatus {
    USER_NOT_FOUND = 'user_not_found',
    WRONG_PASSWORD = 'wrong_password',
    INVALID_CREDENTIALS = 'invalid_credentails',
    INVALID_PASSWORD = 'invalid_password',
    NOT_SCHEDULED_TODAY = 'NOT_SCHEDULED_TODAY',
    EXAM_ALREADY_COMPLETED = 'EXAM_ALREADY_COMPLETED',
    EXAM_SUSPENDED = 'EXAM_SUSPENDED',
}

export interface StudentLoginResult extends Result<
    Status | StudentLoginStatus
> {
    studentLogin?: StudentLoginInfo[]
    total?: number
}
