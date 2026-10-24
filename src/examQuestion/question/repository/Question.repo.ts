import { injectable } from 'tsyringe'
import { AppDataSource } from '../../../config/data-source'
import { QuestionRepositoryMethods } from './Question.repoInterface'
import { ResultSetHeader } from 'mysql2'
import { questionData, QuestionRow } from '../types/Question.types'
import { QuestionInputMode } from '../enums/Question.enum'
import { QueryRunner } from 'typeorm'
import { GetPaginationOptions } from '../../../constant/Result.types'

@injectable()
export class QuestionRepository implements QuestionRepositoryMethods {
    addQuestion = async (
        data: {
            inputMode: QuestionInputMode
            question: string
            courseId: number
            createdBy: string
        },
        queryRunner?: QueryRunner
    ): Promise<ResultSetHeader> => {
        const manager = queryRunner
            ? queryRunner.manager
            : AppDataSource.manager

        const result = manager.query(
            `INSERT INTO question
     (inputMethod,question,courseId,createdBy)
     VALUES (?,?,?,?)`,
            [data.inputMode, data.question, data.courseId, data.createdBy]
        )
        return result
    }

    getQuestionByCourseId = async (
        courseId: number
    ): Promise<QuestionRow[]> => {
        const rows = await AppDataSource.query(
            `
        SELECT id, question
        FROM question
        WHERE courseId = ?
          AND isDeleted = 0
        `,
            [courseId]
        )

        return rows.map((r: QuestionRow) => ({
            id: r.id,
            question: r.question,
        }))
    }
    getQuestionByAnswer = async (
        questionId: number,
        queryRunner: QueryRunner
    ): Promise<{ optionId: number }[]> => {
        const manager = queryRunner
            ? queryRunner.manager
            : AppDataSource.manager
        const rows = await manager.query(
            `
        SELECT o.id as optionId
        FROM question q
        LEFT JOIN options o
        ON o.questionId=q.id and o.isDeleted=0
        WHERE questionId = ? and o.isAnswer=1
          AND q.isDeleted = 0
        `,
            [questionId]
        )

        return rows
    }
    getQuestionById = async (
        id: number
    ): Promise<{ id: number; question: string } | null> => {
        const rows = await AppDataSource.query(
            `SELECT id, question, inputMethod
             FROM question 
             WHERE id = ? AND isDeleted = 0`,
            [id]
        )

        if (rows.length === 0) return null

        return {
            id: rows[0].id,
            question: rows[0].question,
        }
    }

    getCourseByName = async (
        name: string,
        queryRunner?: QueryRunner
    ): Promise<{ id: number } | null> => {
        const manager = queryRunner
            ? queryRunner.manager
            : AppDataSource.manager

        const result = await manager.query(
            `SELECT id FROM sem_course WHERE name = ?`,
            [name]
        )

        if (result.length > 0) {
            return result[0]
        }

        return null
    }
    getAllQuestion = async (
        options: GetPaginationOptions,
        courseId: number
    ): Promise<{ question: questionData[]; total: number }> => {
        const params: number[] = [courseId]
        let paginationClause = ''

        if (
            !options.all &&
            options.limit !== undefined &&
            options.offset !== undefined
        ) {
            paginationClause = ' LIMIT ? OFFSET ? '
            params.push(options.limit, options.offset)
        }

        const query = `
SELECT
    q.courseId,
    sc.name AS courseName,
    q.inputMethod,
    JSON_ARRAYAGG(
        JSON_OBJECT(
            'questionId', q.id,
            'question', q.question,
            'options', opt.options
        )
    ) AS questions
FROM (
    SELECT *
    FROM question
    WHERE isDeleted = 0
   AND courseId =?
    ${paginationClause}
) q


 LEFT JOIN sem_questioncourse  sc
 ON sc.id=q.courseId
LEFT JOIN (
    SELECT
        o.questionId,
        JSON_ARRAYAGG(
            JSON_OBJECT(
                'id', o.id,
                'name', o.name,
                'isAnswer', o.isAnswer
            )
        ) AS options
    FROM options o
    GROUP BY o.questionId
) opt
ON opt.questionId = q.id
GROUP BY q.courseId, sc.name, q.inputMethod
  `

        const question = await AppDataSource.manager.query(query, params)

        const totalQuery = `
      SELECT COUNT(*) as total
      FROM question
      WHERE isDeleted = 0
      AND courseId = ?
  `

        const totalResult = await AppDataSource.manager.query(totalQuery, [
            courseId,
        ])

        const total = Number(totalResult[0]?.total ?? 0)

        return { question, total }
    }

    updateQuestion = async (
        data: { id: number; question: string; updatedBy: string },
        queryRunner?: QueryRunner
    ): Promise<ResultSetHeader> => {
        const manager = queryRunner
            ? queryRunner.manager
            : AppDataSource.manager

        const result = manager.query(
            `UPDATE question SET     
            question = COALESCE(?, question),
       updatedBy = COALESCE(?, updatedBy)
      WHERE id = ?`,
            [data.question, data.updatedBy, data.id]
        )
        return result
    }

    deleteQuestion = async (
        id: number,
        deletedBy: string
    ): Promise<ResultSetHeader> => {
        const manager = AppDataSource.manager

        const result = manager.query(
            `UPDATE question SET     
            isDeleted=1,deletedBy=?
      WHERE id = ?`,
            [deletedBy, id]
        )
        return result
    }
}
