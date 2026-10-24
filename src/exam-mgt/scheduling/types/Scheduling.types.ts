export enum ExamScheduleStatus {
    SCHEDULED = 'SCHEDULED',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
    ABSENT = 'ABSENT',
}
import { Result, Status } from '../../../constant/Result.types'

export type SchedulingInfo = {
    id?: number
    courseId: number
    examDate: string
    status: string
    examRequestId: number
    studentId: number
    createdBy: string
    canSchedule: boolean
}
export interface SelectedStudent {
    studentId: number
    examRequestId: number
}
export interface SchedulingResult extends Result<Status> {
    examSchedule?: SchedulingInfo[]
    total?: number
}
