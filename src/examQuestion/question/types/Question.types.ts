import { Result, Status } from '../../../constant/Result.types'

export type QuestionInfo = {
    courseId: string | number
    inputMode: string
    questions: questionData[]
}

export type optionData = {
    optionName: string
    isAnswer: boolean
    questionId: number
    createdBy: string
}

export type questionData = {
    question: string
    options: optionData[]
}

export type QuestionRow = {
    id: number
    question: string
}

export interface QuestionResult extends Result<Status> {
    question?: questionData[] | string[]
    total?: number
}
