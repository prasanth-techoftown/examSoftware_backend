import { injectable } from 'tsyringe'
import { AppDataSource } from '../../../../config/data-source'
import { QueryRunner } from 'typeorm'
import { ResultSetHeader } from 'mysql2'
import { ExamAnswerLogDTO } from '../controller/ExamAnswerLogs.DTO'
import { ExamAnswerLogRepositoryMethods } from './ExamAnswerLogs.repoInterface'
import { ScoreRow } from '../types/ExamAnswerLogs.types'

@injectable()
export class ExamAnswerLogRepository implements ExamAnswerLogRepositoryMethods {
    addAnswerLog = async (
        data: ExamAnswerLogDTO,
        isCorrect: number,
        queryRunner: QueryRunner
    ): Promise<ResultSetHeader> => {
        const manager = queryRunner
            ? queryRunner.manager
            : AppDataSource.manager

        return manager.query(
            `INSERT INTO sem_exam_answerLogs
            (answeredAt, isCorrect, questionId, optionId, examSessionId, createdBy)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
            optionId   = VALUES(optionId),
            isCorrect  = VALUES(isCorrect),
            answeredAt = VALUES(answeredAt)`,
            [
                data.getAnsweredAt(),
                isCorrect,
                data.getQuestionId(),
                data.getOptionId(),
                data.getExamSessionId(),
                data.getCreatedBy(),
            ]
        )
    }

    getScoreByExamSessionId = async (
        sessionId: number,
        queryRunner: QueryRunner
    ): Promise<ScoreRow> => {
        const rows: ScoreRow[] = await queryRunner.manager.query(
            `
        SELECT 
            SUM(CASE WHEN isCorrect = 1 THEN 1 ELSE 0 END) AS correctCount,
            SUM(CASE WHEN isCorrect = 0 THEN 1 ELSE 0 END) AS wrongCount,
              COUNT(isCorrect) AS attemptedCount
        FROM sem_exam_answerLogs
        WHERE examSessionId = ?
          AND isDeleted = 0
        `,
            [sessionId]
        )

        return {
            attemptedCount: Number(rows[0]?.attemptedCount ?? 0),
            correctCount: Number(rows[0]?.correctCount ?? 0),
            wrongCount: Number(rows[0]?.wrongCount ?? 0),
        }
    }
    getSavedAnswersBySessionId = async (
        sessionId: number
    ): Promise<
        { questionId: number; sessionQuestionId: number; optionId: number }[]
    > => {
        return AppDataSource.manager.query(
            `SELECT 
            al.questionId,
            esq.id AS sessionQuestionId,
            al.optionId
         FROM sem_exam_answerLogs al
         LEFT JOIN sem_exam_session_question esq 
             ON esq.questionId = al.questionId 
             AND esq.examSessionId = al.examSessionId
         WHERE al.examSessionId = ?
           AND al.isDeleted = 0`,
            [sessionId]
        )
    }
}
