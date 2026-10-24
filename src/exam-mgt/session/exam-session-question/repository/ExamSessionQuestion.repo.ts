import { injectable } from 'tsyringe'
import { AppDataSource } from '../../../../config/data-source'
import { ExamSessionQuestionDTO } from '../controller/ExamSessionQuestion.DTO'
import { ResultSetHeader } from 'mysql2'
import { ExamSessionQuestionRepositoryMethods } from './ExamsessionQuestion.repoInterface'
import { QueryRunner } from 'typeorm'
import { ExamSessionQuestion } from '../types/ExamQuestion.types'

@injectable()
export class ExamSessionQuestionRepository implements ExamSessionQuestionRepositoryMethods {
    addExamSessionQuestions = async (
        questions: ExamSessionQuestionDTO[],
        queryRunner: QueryRunner
    ): Promise<ResultSetHeader> => {
        const values = questions.map((q) => [
            q.getExamSessionId(),
            q.getQuestionId(),
            q.getCreatedBy(),
        ])

        const manager = queryRunner
            ? queryRunner.manager
            : AppDataSource.manager
        return manager.query(
            `INSERT INTO sem_exam_session_question
             (examSessionId, questionId, createdBy)
             VALUES ?`,
            [values]
        )
    }
    getExamQuestionBySessionId = async (
        examSessionId: number
    ): Promise<ExamSessionQuestion[]> => {
        const query = `
       SELECT 
    esq.id AS sessionQuestionId,
    q.id AS questionId,
    q.question AS questionText,
    q.inputMethod,
    q.courseId,
       JSON_ARRAYAGG(
        JSON_OBJECT(
            'id', opt.id,
            'optionName', opt.name
        )
    ) AS options
FROM sem_exam_session_question esq
LEFT JOIN question q ON q.id = esq.questionId
LEFT JOIN options opt ON opt.questionId = q.id
WHERE esq.examSessionId = ?
  AND esq.isDeleted = 0
  AND q.isDeleted = 0
GROUP BY esq.id, q.id, q.question, q.inputMethod, q.courseId
ORDER BY esq.id ASC;
    `
        const result = await AppDataSource.manager.query(query, [examSessionId])

        return result
    }
}
