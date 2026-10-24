import { injectable } from 'tsyringe'
import { AppDataSource } from '../../../../config/data-source'
import { StudentInfo } from '../../../../student/types/Student.types'
import { ExamSessionQuestionDTO } from '../../exam-session-question/controller/ExamSessionQuestion.DTO'
import { ExamSessionRepositoryMethods } from './ExamSession.repoInterface'
import { QueryRunner } from 'typeorm'
import { ExamSessionDTO } from '../controller/ExamSession.DTO'
import { SubmitExamSessionDTO } from '../controller/SubmitExamSession.DTO'
import { ResultSetHeader } from 'mysql2'
import {
    ExamSessionInfo,
    ExamSessionStatus,
    ExamSessionTime,
    ResultInfo,
    StudentEligibilityResult,
} from '../types/ExamSession.types'
import { GetPaginationOptions } from '../../../../constant/Result.types'
import { ExamLogsInfo } from '../../../logs/examLogs/types/ExamLogs.types'

@injectable()
export class ExamSessionRepository implements ExamSessionRepositoryMethods {
    startExamForStudent = async (
        id: string,
        data: ExamSessionDTO,
        remainingSeconds: string | string,
        queryRunner: QueryRunner
    ): Promise<number> => {
        const manager = queryRunner
            ? queryRunner.manager
            : AppDataSource.manager
        await manager.query(
            `INSERT INTO sem_exam_session
(id, exam_session_status, studentId, examSchedulingId, createdBy, totalQuestion, startedAt, remainingSeconds)
VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id,
                data.getExamSessionStatus(),
                data.getStudentId(),
                data.getExamSchedulingId(),
                data.getCreatedBy(),
                data.getTotalQuestion(),
                data.getStartedAt(),
                remainingSeconds,
            ]
        )

        return Number(id)
    }
    getStudentById = async (studentId: number): Promise<StudentInfo[]> => {
        const query = `SELECT id,courseId FROM sem_student WHERE id=?`
        return AppDataSource.manager.query(query, [studentId])
    }
    getDurationByCourseId = async (
        courseId: number
    ): Promise<{ durationMinutes: number } | null> => {
        const result = await AppDataSource.manager.query(
            `
        SELECT qm.time AS durationMinutes
        FROM sem_question_mapping qm
        WHERE qm.crmCourseId = ?
          AND qm.isDeleted = 0
        LIMIT 1
        `,
            [courseId]
        )

        if (!result || result.length === 0) return null

        return {
            durationMinutes: Number(result[0].durationMinutes),
        }
    }
    deleteSession = async (
        sessionId: number,
        manager: QueryRunner
    ): Promise<ResultSetHeader> => {
        return manager.query(`DELETE FROM sem_exam_session WHERE id = ?`, [
            sessionId,
        ])
    }

    deleteAnswerLogs = async (
        sessionId: number,
        manager: QueryRunner
    ): Promise<ResultSetHeader> => {
        return manager.query(
            `DELETE FROM sem_exam_answerLogs WHERE examSessionId = ?`,
            [sessionId]
        )
    }

    deleteSessionQuestionLogs = async (
        sessionId: number,
        manager: QueryRunner
    ): Promise<ResultSetHeader> => {
        return manager.query(
            `DELETE FROM sem_exam_session_question WHERE examSessionId = ?`,
            [sessionId]
        )
    }
    getScore = async (
        examSessionId: number,
        queryRunner?: QueryRunner
    ): Promise<ResultInfo[]> => {
        const manager = queryRunner
            ? queryRunner.manager
            : AppDataSource.manager
        const query = `SELECT   es.id AS examSessionId,
    es.score AS score,es.attendedQuestions,es.totalQuestion,
s.firstName,s.lastName,s.courseName,   es.startedAt,
    es.submittedAt,   qm.time AS totalTime,es.result_status
        FROM sem_exam_session es
        LEFT JOIN sem_student s
        ON s.id=es.studentId
        LEFT JOIN sem_question_mapping qm
    ON qm.crmCourseId = s.courseId
        WHERE es.id=? 
        and es.exam_session_status !='IN_PROGRESS'`
        const result = await manager.query(query, [examSessionId])
        return result
    }
    addExamSessionQuestions = async (questions: ExamSessionQuestionDTO[]) => {
        const values = questions.map((q) => [
            q.getExamSessionId(),
            q.getQuestionId(),
            q.getCreatedBy(),
        ])
        return AppDataSource.manager.query(
            `INSERT INTO sem_exam_session_questions
             (examSessionId, questionId, createdBy)
             VALUES ?`,
            [values]
        )
    }
    checkStudentHasActiveSession = async (
        studentId: number,
        queryRunner: QueryRunner
    ): Promise<ExamLogsInfo[]> => {
        const result = await queryRunner.query(
            `SELECT id  as examSessionId,score,percentage,grade,result_status as result,studentId
         FROM sem_exam_session
         WHERE studentId = ?
           AND isDeleted = 0
         LIMIT 1`,
            [studentId]
        )

        return result
    }
    getStudentByExamStatus = async ({
        limit,
        offset,
        all = false,
        search,
        date,
    }: GetPaginationOptions): Promise<{
        students: ExamSessionInfo[]
        total: number
    }> => {
        const hasFilter = !!(search || date)
        const isAllMode = all === true
        let whereClause = ` WHERE es.isDeleted = 0 `
        const params = []

        if (search) {
            whereClause += ` AND (s.firstName LIKE ? OR s.lastName LIKE ? OR s.admissionNumber LIKE ?)`
            params.push(`%${search}%`, `%${search}%`, `%${search}%`)
        }

        if (date) {
            whereClause += ` AND sch.examDate = ?`
            params.push(date)
        }
        let query = `
        SELECT 
            es.id,
            es.exam_session_status,
            es.submittedAt,
            es.score,
            es.totalQuestion,
            es.grade,
            es.result_status,
            b.name AS branchName,
            s.firstName,
            s.lastName,
            s.admissionNumber,sch.examDate
        FROM sem_exam_session es
        LEFT JOIN sem_student s ON s.id = es.studentId AND s.isDeleted = 0
      INNER JOIN sem_exam_schedule sch
ON sch.id = es.examSchedulingId AND sch.isDeleted = 0
        LEFT JOIN branch b ON b.id = s.branchId AND b.isDeleted = 0
           ${whereClause}

    `

        const countQuery = `
    SELECT COUNT(*) as total
    FROM sem_exam_session es
    LEFT JOIN sem_student s ON s.id = es.studentId AND s.isDeleted = 0
    LEFT JOIN sem_exam_schedule sch ON sch.id = es.examSchedulingId AND sch.isDeleted = 0
    ${whereClause}
`

        const countResult = await AppDataSource.query(countQuery, params)
        const total = countResult[0]?.total || 0

        if (!isAllMode && !hasFilter) {
            query += ` LIMIT ? OFFSET ?`
            params.push(limit, offset)
        }
        const students = await AppDataSource.query(query, params)

        return { students, total }
    }

    getGradeByPercentage = async (
        percentage: number,
        queryRunner: QueryRunner
    ): Promise<string | null> => {
        const manager = queryRunner.manager
        const result = await manager.query(
            `SELECT grade
         FROM sem_grade
         WHERE ? BETWEEN minRange AND maxRange
         AND isDeleted = 0
         LIMIT 1`,
            [percentage]
        )
        return result.length > 0 ? result[0].grade : null
    }
    getRandomQuestionsForCourse = async (
        crmCourseId: number
    ): Promise<{ questionId: number }[]> => {
        const subjects: {
            questionCourseId: number
            subjectTotalQuestion: number
        }[] = await AppDataSource.manager.query(
            `SELECT questionCourseId, subjectTotalQuestion
             FROM sem_question_mapping
             WHERE crmCourseId = ?
               AND isDeleted = 0`,
            [crmCourseId]
        )

        let allQuestions: { questionId: number }[] = []

        for (const subj of subjects) {
            const questions: { questionId: number }[] =
                await AppDataSource.manager.query(
                    `SELECT q.id AS questionId
             FROM question q
             WHERE q.courseId = ?
               AND q.isDeleted = 0
             ORDER BY RAND()
             LIMIT ?`,
                    [subj.questionCourseId, subj.subjectTotalQuestion]
                )
            allQuestions = allQuestions.concat(questions)
        }

        allQuestions = allQuestions.sort(() => Math.random() - 0.5)

        return allQuestions
    }

    updateExamSession = async (
        data: SubmitExamSessionDTO,
        score: number,
        attemptedCount: number,

        grade: string,
        result_status: string,
        percentage: string | number,
        queryRunner: QueryRunner
    ): Promise<ResultSetHeader> => {
        return queryRunner.manager.query(
            `
        UPDATE sem_exam_session
        SET exam_session_status = ?,
            submittedAt = ?,
            score = ?,
            attendedQuestions = ?,
            grade=?,
            result_status=?,
             percentage = ?,  
            updatedBy = ?,
            updatedAt = NOW()
        WHERE id = ?
          AND isDeleted = 0
        `,
            [
                ExamSessionStatus.SUBMITTED,
                data.getSubmittedAt(),
                score,

                attemptedCount,
                grade,
                result_status,
                percentage,
                data.getUpdatedBy(),
                data.getexamSessionId(),
            ]
        )
    }
    // getExamSessionById = async (
    //     examSessionId: number,
    //     queryRunner: QueryRunner
    // ): Promise<{ examSchedulingId: number; totalQuestion: number } | null> => {
    //     const rows = await queryRunner.manager.query(
    //         `
    //     SELECT examSchedulingId,totalQuestion
    //     FROM sem_exam_session
    //     WHERE id = ?
    //       AND isDeleted = 0
    //     `,
    //         [examSessionId]
    //     )

    //     return rows[0] ?? null
    // }

    getExamSessionById = async (
        examSessionId: number,
        queryRunner: QueryRunner
    ): Promise<{
        examSchedulingId: number
        totalQuestion: number
        studentId: string
        admissionId: string
        branchId: string
        completionDate: string
    } | null> => {
        const rows = await queryRunner.manager.query(
            `
        SELECT examSchedulingId,totalQuestion,ses.studentId,af.id as admissionId,s.branchId,ssc.examDate, DATE_FORMAT(
          DATE_ADD(
              STR_TO_DATE(af.dateOfAdmission, '%Y-%m-%d'),
              INTERVAL CAST(c.durationInMonths AS UNSIGNED) MONTH
          ),
          '%Y-%m-%d'
      ) AS completionDate
        FROM sem_exam_session ses

        LEFT JOIN sem_student s
        ON s.id=ses.studentId

    LEFT JOIN sem_exam_schedule ssc
        ON s.id=ssc.studentId

        LEFT JOIN admission_form af
        ON af.admissionNumber=s.admissionNumber

  LEFT JOIN course c
      ON c.id = af.courseId

        WHERE ses.id = ?
          AND ses.isDeleted = 0
        `,
            [examSessionId]
        )

        return rows[0] ?? null
    }
    checkExistingSession = async (
        studentId: number,
        examSchedulingId: number,
        queryRunner: QueryRunner
    ): Promise<{ id: number } | null> => {
        const manager = queryRunner
            ? queryRunner.manager
            : AppDataSource.manager
        const rows = await manager.query(
            `SELECT id FROM sem_exam_session
         WHERE studentId = ?
           AND examSchedulingId = ?
           AND isDeleted = 0
         LIMIT 1`,
            [studentId, examSchedulingId]
        )
        return rows[0] ?? null
    }
    getSessionStartAndDuration = async (
        examStudentId: number
    ): Promise<ExamSessionTime | null> => {
        const query = `
      SELECT 
        s.startedAt,
        qm.time AS durationMinutes
      FROM sem_exam_session s
    LEFT  JOIN sem_student es 
        ON es.id = s.studentId
       
    LEFT  JOIN sem_question_mapping qm 
        ON qm.crmCourseId = es.courseId  
      WHERE es.id = ?
        AND s.isDeleted = 0
      LIMIT 1
    `

        const result = await AppDataSource.manager.query(query, [examStudentId])

        if (!result || result.length === 0) return null

        return {
            startedAt: result[0].startedAt,
            durationMinutes: Number(result[0].durationMinutes),
        }
    }

    checkStudentEligibility = async (
        studentId: number
    ): Promise<StudentEligibilityResult> => {
        const result = await AppDataSource.query(
            `
        SELECT
            sch.id                   AS scheduleId,
            sch.status               AS scheduleStatus,
            sch.examDate,
            sess.id                  AS sessionId,
            sess.exam_session_status AS sessionStatus,
            sess.startedAt,
            sess.submittedAt,
            sess.score,
            sess.totalQuestion,
            sess.attendedQuestions,
            sess.remainingSeconds,
            s.firstName,
            s.lastName,
            s.courseName
        FROM sem_exam_schedule sch
        LEFT JOIN sem_exam_session sess
            ON  sess.studentId        = sch.studentId
            AND sess.examSchedulingId = sch.id
            AND sess.isDeleted        = 0
        LEFT JOIN sem_student s
            ON  s.id = sch.studentId
            AND s.isDeleted = 0
        WHERE sch.studentId  = ?
          AND DATE(sch.examDate) = CURDATE()
          AND sch.isDeleted  = 0
        ORDER BY sch.id DESC, sess.id DESC
        LIMIT 1
        `,
            [studentId]
        )
        return result[0] ?? null
    }
    updateStudentExamStatus = async (
        sessionId: number,
        status: ExamSessionStatus
    ): Promise<ResultSetHeader> => {
        const result = AppDataSource.manager.query(
            `Update sem_exam_session set exam_session_status= ? where id =?`,
            [status, sessionId]
        )
        return result
    }

    getSuspendedStudents = async ({
        limit,
        offset,
        search,
    }: GetPaginationOptions): Promise<{
        students: ExamSessionInfo[]
        total: number
    }> => {
        const params: (string | number)[] = ['SUSPENDED']

        let whereClause = `
        WHERE es.exam_session_status = ?
        AND es.isDeleted = 0
    `

        if (search) {
            whereClause += `
            AND (
                s.firstName LIKE ?
                OR s.lastName LIKE ?
                OR s.admissionNumber LIKE ?
            )
        `
            params.push(`%${search}%`, `%${search}%`, `%${search}%`)
        }

        const query = `
        SELECT
            es.id AS sessionId,
            es.exam_session_status,
            es.startedAt,
            es.examSchedulingId AS scheduleId,

            s.firstName,
            s.lastName,
            s.admissionNumber,
            s.branchName,

            sch.examDate,

            COUNT(
                CASE
                    WHEN log.action = 'SUSPENDED'
                    THEN 1
                END
            ) AS suspendCount,

            COUNT(
                CASE
                    WHEN log.action = 'CRASH'
                    THEN 1
                END
            ) AS crashCount,

            COUNT(
                CASE
                    WHEN log.action = 'RESET'
                    THEN 1
                END
            ) AS resetCount

        FROM sem_exam_session es

        LEFT JOIN sem_student s
            ON s.id = es.studentId
            AND s.isDeleted = 0

        LEFT JOIN sem_exam_schedule sch
            ON sch.id = es.examSchedulingId
            AND sch.isDeleted = 0

        LEFT JOIN sem_exam_activity_log log
            ON log.studentId = es.studentId

        ${whereClause}

        GROUP BY es.id

        ORDER BY es.updatedAt DESC

        LIMIT ? OFFSET ?
    `

        const countQuery = `
        SELECT COUNT(*) AS total
        FROM sem_exam_session es

        LEFT JOIN sem_student s
            ON s.id = es.studentId
            AND s.isDeleted = 0

        ${whereClause}
    `

        const countResult = await AppDataSource.query(countQuery, params)

        const total = Number(countResult[0]?.total ?? 0)

        const students = await AppDataSource.query(query, [
            ...params,
            limit,
            offset,
        ])

        return { students, total }
    }
    allowReAttempt = async (sessionId: number) => {
        const result = await AppDataSource.manager.query(
            `
        UPDATE sem_exam_session
        SET exam_session_status = 'IN_PROGRESS',
            updatedAt = NOW()
        WHERE id = ?
          AND isDeleted = 0
        `,
            [sessionId]
        )

        return result
    }
    getExistingSession = async (
        sessionId: number
    ): Promise<
        {
            studentId: number
            examSchedulingId: number
            totalQuestion: number
            createdBy: string
        }[]
    > => {
        const rows = await AppDataSource.manager.query(
            `SELECT studentId, examSchedulingId, totalQuestion, createdBy
             FROM sem_exam_session
             WHERE id = ? AND isDeleted = 0`,
            [sessionId]
        )
        return rows
    }
}
