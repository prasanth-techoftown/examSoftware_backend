import { QueryRunner } from 'typeorm'
import { ResultSetHeader } from 'mysql2'
import { ExamAnswerLogDTO } from '../controller/ExamAnswerLogs.DTO'
import { ScoreRow } from '../types/ExamAnswerLogs.types'

export interface ExamAnswerLogRepositoryMethods {
    addAnswerLog(
        data: ExamAnswerLogDTO,
        isCorrect: number,
        queryRunner: QueryRunner
    ): Promise<ResultSetHeader>
    getScoreByExamSessionId(
        sessionId: number,
        queryRunner: QueryRunner
    ): Promise<ScoreRow>
    getSavedAnswersBySessionId(
        sessionId: number
    ): Promise<
        { questionId: number; sessionQuestionId: number; optionId: number }[]
    >
}
