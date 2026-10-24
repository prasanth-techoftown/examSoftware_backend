import { Result, Status } from '../../../../constant/Result.types'

export type ExamLogsInfo = {
    studentId: number
    examSessionId: number
    grade: string
    score: number
    percentage: number
    result: string
}

export interface ExamLogsResult extends Result<Status> {
    ExamLogs?: ExamLogsInfo[]
}
export enum ExamActivityAction {
    CRASH = 'CRASH',
    SUSPENDED = 'SUSPENDED',
    RESET = 'RESET',
    RE_EXAM = 'RE_EXAM',
    IMPROVEMENT = 'IMPROVEMENT',
}
