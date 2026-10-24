import { Result, Status } from '../../../constant/Result.types'

export enum ExamStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
}
export interface ExamRequestInsertedRow {
    id: number
    studentId: number
}
export type ExamRequestInfo = {
    name: string
    createdBy: string
    status: ExamStatus
    firstName: string
    lastName: string
    phoneNumber: string
    courseId: number
    totalFees: number
}

export interface ExamRequestResult extends Result<Status> {
    exam?: ExamRequestInfo[]
    total?: number
}
