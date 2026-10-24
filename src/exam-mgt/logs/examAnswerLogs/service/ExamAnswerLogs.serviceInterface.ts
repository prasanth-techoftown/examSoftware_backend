import { ExamAnswerLogDTO } from '../controller/ExamAnswerLogs.DTO'
import { ExamAnswerResult } from '../types/ExamAnswerLogs.types'

export interface ExamAnswerLogServiceMethods {
    addAnswerLog(data: ExamAnswerLogDTO): Promise<ExamAnswerResult>
    getSavedAnswers(
        sessionId: number
    ): Promise<
        { questionId: number; sessionQuestionId: number; optionId: number }[]
    >
}
