import { Result, Status } from '../../../../constant/Result.types'

export type ExamSessionQuestion = {
    sessionQuestionId: number
    questionId: number
    questionText: string
    inputMethod: 'MANUAL' | 'EXCEL'
    courseId: number
    options: string[]
}

export interface ExamQuestionResult extends Result<Status> {
    questions?: ExamSessionQuestion[]
}
