import { injectable } from 'tsyringe'

import { AppDataSource } from '../../../config/data-source'
import { SchedulingInfo } from '../types/Scheduling.types'
import { ResultSetHeader } from 'mysql2'
import { GetPaginationOptions } from '../../../constant/Result.types'
import { SchedulingRepositoryMethods } from './Scheduling.repoInterface'
import { StudentInfo } from '../../../student/types/Student.types'
import { QueryRunner } from 'typeorm'
@injectable()
export class SchedulingRepository implements SchedulingRepositoryMethods {
    addScheduling = async (
        examDate: string,
        studentId: number,
        examRequestId: number | null,
        createdBy: string,
        queryRunner: QueryRunner
    ): Promise<ResultSetHeader> => {
        const manager = queryRunner
            ? queryRunner.manager
            : AppDataSource.manager
        return manager.query(
            `INSERT INTO sem_exam_schedule
     (
        examDate,
        studentId,
            examRequestId,
        createdBy)
     VALUES (?,?,?,?)`,
            [examDate, studentId, examRequestId, createdBy]
        )
    }
    getLatestSchedulingStatus = async (
        studentId: number,
        queryRunner: QueryRunner
    ): Promise<{ status: string; name: string }[]> => {
        return await queryRunner.query(
            `SELECT status 
         FROM sem_exam_schedule 
         WHERE studentId = ? 
         ORDER BY id DESC 
         LIMIT 1`,
            [studentId]
        )
    }
    getStudentById = async (
        studentId: number,
        queryRunner: QueryRunner
    ): Promise<StudentInfo[]> => {
        const query = `SELECT id,admissionNumber,dateOfBirth,courseId FROM sem_student WHERE id=?`
        return queryRunner.manager.query(query, [studentId])
    }

    getAllScheduling = async ({
        limit,
        offset,
        all = false,
    }: GetPaginationOptions): Promise<{
        scheduling: SchedulingInfo[]
        total: number
    }> => {
        let paginationClause = ''

        const paginationParams = []

        if (!all && limit !== undefined && offset !== undefined) {
            paginationClause = ' LIMIT ? OFFSET ? '
            paginationParams.push(limit, offset)
        }

        const schedulingsQuery = `
SELECT 
    s.id AS studentId,
    s.firstName,
    s.lastName,
    s.admissionNumber,
    s.courseName,
    s.courseId,

    er.id AS examRequestId,
    er.attemptNumber,

    COUNT(es.id) AS scheduledCount,

    CASE 
        WHEN COUNT(es.id) >= er.attemptNumber THEN 'SCHEDULED'
        ELSE null
    END AS status

FROM exam_request er

LEFT JOIN admission_form af 
    ON af.id = er.admissionId

LEFT JOIN sem_student s 
    ON s.admissionNumber = af.admissionNumber

LEFT JOIN sem_exam_schedule es 
    ON es.examRequestId = er.id 
    AND es.isDeleted = 0

WHERE er.isDeleted = 0
AND er.status = 'APPROVED'

GROUP BY er.id, s.id

ORDER BY s.firstName ASC

${paginationClause}
`
        const scheduling = await AppDataSource.manager.query(schedulingsQuery, [
            ...paginationParams,
        ])

        const totalQuery = `
SELECT COUNT(*) as total FROM (
    SELECT 
        er.id,
        er.attemptNumber
    FROM exam_request er

    LEFT JOIN sem_exam_schedule es 
        ON es.examRequestId = er.id 
        AND es.isDeleted = 0

    WHERE er.isDeleted = 0
    AND er.status = 'APPROVED'

    GROUP BY er.id

    HAVING er.attemptNumber > COUNT(es.id)
) as countTable
`
        const totalResult = await AppDataSource.manager.query(totalQuery)
        const total = totalResult[0]?.total ?? 0
        return { scheduling, total }
    }

    updateExamScheduleStatus = async (
        examSchedulingId: number,
        updatedBy: string,
        queryRunner: QueryRunner
    ): Promise<ResultSetHeader> => {
        return queryRunner.manager.query(
            `
        UPDATE sem_exam_schedule
        SET status = 'COMPLETED',
            updatedBy = ?,
            updatedAt = NOW()
        WHERE id = ?
          AND isDeleted = 0
        `,
            [updatedBy, examSchedulingId]
        )
    }

    getCourseScheduleStats = async (
        courseIds: number[]
    ): Promise<
        {
            courseId: number
            questionCount: number
            mappingCount: number
        }[]
    > => {
        if (!courseIds.length) return []

        return await AppDataSource.query(
            `
     SELECT 
    sqm.crmCourseId AS courseId,
    COUNT(DISTINCT sqm.questionCourseId) AS mappingCount,
    COUNT(q.id) AS questionCount
FROM sem_question_mapping sqm
LEFT JOIN question q 
    ON q.courseId = sqm.questionCourseId
   AND q.isDeleted = 0
WHERE sqm.crmCourseId IN (?)
  AND sqm.isDeleted = 0
GROUP BY sqm.crmCourseId
        `,
            [courseIds]
        )
    }
}
