import { Result, Status } from '../../../../constant/Result.types'

export type ExamAnswerInfo = {
    answeredAt: string
    isCorrect: number
    questionId: number
    optionId: number
    examSessionId: number
    createdBy: string
}
export type ScoreRow = {
    attemptedCount: number
    correctCount: number
    wrongCount: number
}
export interface ExamAnswerResult extends Result<Status> {
    data?: ExamAnswerInfo[]
}
