import { injectable } from 'tsyringe'
import { ExamRequestRepoMethods } from './ExamRequest.repoInterface'
import { ExamRequestDTO } from '../controller/ExamRequest.DTO'
import { ResultSetHeader } from 'mysql2'
import { AppDataSource } from '../../../config/data-source'
import { GetPaginationOptions } from '../../../constant/Result.types'
import {
    ExamRequestInfo,
    ExamRequestInsertedRow,
    ExamStatus,
} from '../types/ExamRequest.types'
import { UpdateExamRequestDTO } from '../controller/UpdateExamRequest.DTO'
import { StudentInfo } from '../../../student/types/Student.types'
import { QueryRunner } from 'typeorm'
import { AppError } from '../../../constant/App.error'
import { ExamScheduleStatus } from '../../scheduling/types/Scheduling.types'
import { SqlParam } from '../../../certificate/certificateIssue/types/Certificate.types'

@injectable()
export class ExamRequestRepository implements ExamRequestRepoMethods {
   addExamRequest = async (data: ExamRequestDTO[]): Promise<ExamRequestInsertedRow[]> => {
    const studentIds = data.map((e) => e.getStudentId())

    const existing: { id: number; studentId: number; status: string; attempt: number }[] =
        await AppDataSource.manager.query(
            `SELECT id, studentId, status, COALESCE(attemptNumber, 0) AS attempt
             FROM exam_request
             WHERE studentId IN (${studentIds.map(() => '?').join(',')})
               AND isDeleted = 0`,
            studentIds
        )

    const existingIds = existing.map((r) => r.studentId)
    const toInsert = data.filter((d) => !existingIds.includes(d.getStudentId()))

    // Only REJECTED requests are re-opened. Pending/approved ones are left untouched.
    const rejected = existing.filter((r) => r.status === 'REJECTED')
    for (const r of rejected) {
        const req = data.find((d) => d.getStudentId() === r.studentId)
        if (!req) continue
        await AppDataSource.manager.query(
            `UPDATE exam_request
             SET status = 'PENDING', examDate = ?, date = ?, time = ?,
                 reason = NULL, attemptNumber = ?, updatedAt = NOW()
             WHERE id = ?`,
            [req.getExamDate(), req.getDate(), req.getTime(), Number(r.attempt) + 1, r.id]
        )
    }

    let inserted: ExamRequestInsertedRow[] = []
    if (toInsert.length) {
        const values = toInsert.map((e) => [
            e.getStudentId(), e.getExamDate(), e.getDate(), e.getTime(), e.getCreatedBy(),
        ])
        const res: ResultSetHeader = await AppDataSource.manager.query(
            `INSERT INTO exam_request(studentId, examDate, date, time, createdBy) VALUES ?`,
            [values]
        )
        inserted = toInsert.map((item, i) => ({
            id: res.insertId + i,
            studentId: item.getStudentId(),
        }))
    }

    return [...inserted, ...rejected.map((r) => ({ id: r.id, studentId: r.studentId }))]
}

getStudentCourseDetails = async (studentIds: number[]) => {
    if (!studentIds.length) return []
    return AppDataSource.manager.query(
        `SELECT s.id AS studentId, s.courseId
         FROM sem_student s
         INNER JOIN sem_course c ON c.id = s.courseId AND c.isDeleted = 0
         WHERE s.id IN (${studentIds.map(() => '?').join(',')})
           AND s.isDeleted = 0`,
        studentIds
    )
}
   getAllExamRequests = async (
    options: GetPaginationOptions
): Promise<{
    total: number
    exams: ExamRequestInfo[]
}> => {
    const whereConditions: string[] = [
        'e.isDeleted = 0',
        'e.status = ?',
       
    ]

    const params: SqlParam[] = [ExamStatus.PENDING]

    if (options.search) {
        const searchValue = `%${options.search
            .toLowerCase()
            .replace(/\s/g, '')}%`

        whereConditions.push(`
            (
                LOWER(REPLACE(s.firstName, ' ', '')) LIKE ?
                OR LOWER(REPLACE(s.lastName, ' ', '')) LIKE ?
                OR LOWER(REPLACE(c.name, ' ', '')) LIKE ?
                OR LOWER(REPLACE(s.admissionNumber, ' ', '')) LIKE ?
            )
        `)

        params.push(
            searchValue,
            searchValue,
            searchValue,
            searchValue
        )
    }

    const limit = Number(options.limit) || 10
    const offset = Number(options.offset) || 0

    const whereClause = whereConditions.join(' AND ')

    const totalQuery = `
        SELECT COUNT(DISTINCT e.id) AS total
        FROM exam_request e
        LEFT JOIN sem_student s
            ON s.id = e.studentId
            AND s.isDeleted = 0
        LEFT JOIN sem_course c
            ON c.id = s.courseId
            AND c.isDeleted = 0
        WHERE ${whereClause}
    `

    const [totalResult] = await AppDataSource.manager.query(
        totalQuery,
        params
    )

    const examsQuery = `
        SELECT
            e.id,
            e.studentId,
            e.status,
            e.examDate,
            s.admissionNumber,
            s.firstName,
            s.lastName,
            s.phoneNumber,
            s.courseId,
            s.totalFees,
            c.name AS courseName,
            c.durationInHrs,
            c.durationInMonths
        FROM exam_request e
        LEFT JOIN sem_student s
            ON s.id = e.studentId
            AND s.isDeleted = 0
        LEFT JOIN sem_course c
            ON c.id = s.courseId
            AND c.isDeleted = 0
        WHERE ${whereClause}
        ORDER BY e.createdAt DESC
        LIMIT ? OFFSET ?
    `

    const exams = await AppDataSource.manager.query(
        examsQuery,
        [...params, limit, offset]
    )

    return {
        total: Number(totalResult?.total ?? 0),
        exams,
    }
}
getStudentData = async (studentId: number): Promise<StudentInfo> => {
    const rows = await AppDataSource.manager.query(
        `SELECT s.*
         FROM sem_student s
         WHERE s.id = ?`,
        [studentId]
    )
    return rows[0]
}

  getStudentByStatus = async (
    { limit, offset, all = false, search }: GetPaginationOptions,
    status: string
): Promise<{ exam: ExamRequestInfo[]; total: number }> => {
    const whereConditions: string[] = [
        'e.isDeleted = 0',
        'af.id IS NOT NULL',
        'c.id IS NOT NULL',
    ]

    const params: (string | number)[] = []

    if (status === ExamStatus.APPROVED) {
        whereConditions.push(
            `EXISTS (
                SELECT 1
                FROM sem_exam_schedule ses
                WHERE ses.examRequestId = e.id
                  AND ses.isDeleted = 0
                  AND ses.status = ?
                  AND ses.examDate >= CURDATE()
            )`
        )

        params.push(ExamScheduleStatus.SCHEDULED)
    }

    if (search?.trim()) {
        whereConditions.push(`
            (
                LOWER(REPLACE(af.firstName, ' ', '')) LIKE ?
                OR LOWER(REPLACE(af.lastName, ' ', '')) LIKE ?
                OR LOWER(REPLACE(c.name, ' ', '')) LIKE ?
                OR LOWER(REPLACE(af.admissionNumber, ' ', '')) LIKE ?
                OR af.phoneNumber LIKE ?
            )
        `)

        const searchValue = `%${search.trim().toLowerCase().replace(/\s/g, '')}%`

        params.push(
            searchValue,
            searchValue,
            searchValue,
            searchValue,
            `%${search.trim()}%`
        )
    }

    if (status) {
        whereConditions.push('e.status = ?')
        params.push(status)
    }

    const whereClause = whereConditions.join(' AND ')

    let paginationClause = ''
    const paginationParams: (string | number)[] = []

    if (!all && limit !== undefined && offset !== undefined) {
        paginationClause = ' LIMIT ? OFFSET ?'
        paginationParams.push(limit, offset)
    }

    const coursesQuery = `
        SELECT
            e.id,
            e.studentId,
            e.status,
            ses.examDate,
            af.admissionNumber,
            af.firstName,
            af.lastName,
            af.phoneNumber,
            af.courseId,
            af.totalFees,
            c.name AS courseName,
            c.durationInHrs,
            c.durationInMonths
        FROM exam_request e
        INNER JOIN sem_student af
            ON e.studentId = af.id
            AND af.isDeleted = 0
        INNER JOIN sem_course c
            ON af.courseId = c.id
            AND c.isDeleted = 0
        LEFT JOIN sem_exam_schedule ses
            ON ses.examRequestId = e.id
            AND ses.isDeleted = 0
        WHERE ${whereClause}
        ORDER BY e.id DESC
        ${paginationClause}
    `

    const exam = await AppDataSource.manager.query(coursesQuery, [
        ...params,
        ...paginationParams,
    ])

    const totalQuery = `
        SELECT COUNT(DISTINCT e.id) AS total
        FROM exam_request e
        INNER JOIN sem_student af
            ON e.studentId = af.id
            AND af.isDeleted = 0
        INNER JOIN sem_course c
            ON af.courseId = c.id
            AND c.isDeleted = 0
        WHERE ${whereClause}
    `

    const totalResult = await AppDataSource.manager.query(
        totalQuery,
        params
    )

    const total = Number(totalResult[0]?.total ?? 0)

    return {
        exam,
        total,
    }
}

    getStudentByStatusForBranch = async (
        branchId: string,
        {
            limit = 5,
            offset = 0,
            search,
        }: {
            limit?: number
            offset?: number
            search?: string
        },
        status: string
    ): Promise<{ students: ExamRequestInfo[]; total: number }> => {
        const whereConditions: string[] = ['e.isDeleted = 0', 'b.id = ?']

        const params: (string | number)[] = [branchId]

        if (status) {
            whereConditions.push('e.status = ?')
            params.push(status)
        }
        if (status === ExamStatus.APPROVED) {
            whereConditions.push('ses.examDate >= CURDATE()', 'ses.status = ?')
            params.push(ExamScheduleStatus.SCHEDULED)
        }

        if (search) {
            whereConditions.push(`
            (
                LOWER(REPLACE(af.firstName,' ','')) LIKE ?
                OR LOWER(REPLACE(af.lastName,' ','')) LIKE ?
                OR LOWER(REPLACE(c.name,' ','')) LIKE ?
            )
        `)

            const cleanSearch = `%${search.replace(/\s/g, '').toLowerCase()}%`

            params.push(cleanSearch, cleanSearch, cleanSearch)
        }

        const totalQuery = `
        SELECT COUNT(DISTINCT e.id) AS total

        FROM exam_request e

        LEFT JOIN sem_student af
            ON e.studentId = af.id
            AND af.isDeleted = 0

        LEFT JOIN sem_exam_schedule ses
            ON ses.examRequestId = e.id
            AND ses.isDeleted = 0


        LEFT JOIN sem_course c
            ON af.courseId = c.id
            AND c.isDeleted = 0

        WHERE ${whereConditions.join(' AND ')}
    `

        const [totalResult] = await AppDataSource.manager.query(
            totalQuery,
            params
        )

        const studentsQuery = `
        SELECT
            e.id,
            e.studentId,
            e.status,

            ses.examDate,

            af.admissionNumber,
            af.firstName,
            af.lastName,
            af.phoneNumber,
            af.totalFees,

            c.id AS courseId,
            c.name AS courseName,
            c.durationInMonths,
            c.durationInHrs

        FROM exam_request e

        LEFT JOIN sem_student af
            ON e.studentId = af.id
            AND af.isDeleted = 0

        LEFT JOIN sem_exam_schedule ses
            ON ses.examRequestId = e.id
            AND ses.isDeleted = 0


        LEFT JOIN sem_course c
            ON af.courseId = c.id
            AND c.isDeleted = 0

        WHERE ${whereConditions.join(' AND ')}

        ORDER BY e.createdAt DESC

        LIMIT ? OFFSET ?
    `

        const students = await AppDataSource.manager.query(studentsQuery, [
            ...params,
            limit,
            offset,
        ])

        return {
            students,
            total: Number(totalResult?.total ?? 0),
        }
    }
    updateStatusByAdmissionId = async (
        data: UpdateExamRequestDTO,
        queryRunner: QueryRunner
    ): Promise<ResultSetHeader> => {
        const manager = queryRunner
            ? queryRunner.manager
            : AppDataSource.manager

        return await manager.query(
            `
            UPDATE exam_request
            SET status = ?, updatedBy = ?, reason = ?,   
            date      = COALESCE(?, date),
    time      = COALESCE(?, time), updatedAt = NOW()
            WHERE id = ?
            `,
            [
                data.getStatus(),
                data.getUpdatedBy(),
                data.getReason(),
                data.getDate(),
                data.getTime(),
                data.getId(),
            ]
        )
    }

   

 toFindCourseName = async (studentId: number) => {
    const rows = await AppDataSource.manager.query(
        `SELECT s.courseId, c.name
         FROM sem_student s
         LEFT JOIN sem_course c ON c.id = s.courseId
         WHERE s.id = ?`,
        [studentId]
    )
    return rows[0]
}
    getStudentIdByAdmissionNumber = async (
        admissionNumber: string,
        queryRunner: QueryRunner
    ): Promise<number> => {
        const rows: { id: number }[] = await queryRunner.manager.query(
            `SELECT id FROM sem_student WHERE admissionNumber = ? LIMIT 1`,
            [admissionNumber]
        )

        if (!rows.length)
            throw new AppError('Student not found after insert', 404)

        return rows[0].id
    }

    approveWithInsert = async (
        admission: StudentInfo,
        data: UpdateExamRequestDTO,
        courseName: string,
        queryRunner: QueryRunner
    ): Promise<void> => {
      
      
        await queryRunner.manager.query(
            `
        UPDATE exam_request
        SET status    = ?,
            updatedBy = ?,
            reason    = NULL,
            date=?,
            time=?,
            updatedAt = NOW()
        WHERE id = ?
        `,
            [
                data.getStatus(),
                data.getUpdatedBy(),
                data.getDate(),
                data.getTime(),
                data.getId(),
            ]
        )
    }

    getMappingsByCrmCourseIds = async (
        courseIds: number
    ): Promise<
        {
            crmCourseId: number
            questionCourseId: number
            subjectTotalQuestion: number
        }[]
    > => {
        return await AppDataSource.query(
            `
        SELECT crmCourseId, questionCourseId, subjectTotalQuestion
        FROM sem_question_mapping
        WHERE crmCourseId =?
          AND isDeleted = 0
        `,
            [courseIds]
        )
    }
    getQuestionCountsByCourseIds = async (
        courseIds: number[]
    ): Promise<{ courseId: number; count: number }[]> => {
        return await AppDataSource.query(
            `
        SELECT courseId, COUNT(*) as count
        FROM question
        WHERE courseId IN (?)
          AND isDeleted = 0
        GROUP BY courseId
        `,
            [courseIds]
        )
    }

    getExamRequestStudentsForBranch = async (
        branchId: string,
        {
            limit = 5,
            offset = 0,
            search,
        }: {
            limit?: number
            offset?: number
            search?: string
        }
    ): Promise<{ students: ExamRequestInfo[]; total: number }> => {
       
 const whereConditions: string[] = [
      'e.isDeleted = 0',
            'e.status = ?',
            'b.id = ?',
    
]
        const params: (string | number)[] = [ExamStatus.PENDING, branchId]

        if (search) {
            const cleanSearch = `%${search.replace(/\s/g, '').toLowerCase()}%`

            whereConditions.push(`
            (
                LOWER(REPLACE(af.firstName,' ','')) LIKE ?
                OR LOWER(REPLACE(af.lastName,' ','')) LIKE ?
                OR LOWER(REPLACE(af.admissionNumber,' ','')) LIKE ?
                OR LOWER(REPLACE(c.name,' ','')) LIKE ?
            )
        `)

            params.push(cleanSearch, cleanSearch, cleanSearch, cleanSearch)
        }

        const totalQuery = `
        SELECT COUNT(e.id) AS total

        FROM exam_request e

        LEFT JOIN sem_student af
            ON e.studentId = af.id
            AND af.isDeleted = 0


        LEFT JOIN sem_course c
            ON af.courseId = c.id
            AND c.isDeleted = 0

        WHERE ${whereConditions.join(' AND ')}
    `

        const [totalResult] = await AppDataSource.manager.query(
            totalQuery,
            params
        )

        const studentsQuery = `
        SELECT
            e.id,
            e.studentId,
            e.status,
            e.examDate,

            af.admissionNumber,
            af.firstName,
            af.lastName,
            af.phoneNumber,
            af.totalFees,

            c.id AS courseId,
            c.name AS courseName,
            c.durationInMonths,
            c.durationInHrs

        FROM exam_request e

        LEFT JOIN sem_student af
            ON e.studentId = af.id
            AND af.isDeleted = 0

        

        LEFT JOIN sem_course c
            ON af.courseId = c.id
            AND c.isDeleted = 0

        WHERE ${whereConditions.join(' AND ')}

        ORDER BY e.createdAt DESC

        LIMIT ? OFFSET ?
    `

        const students = await AppDataSource.manager.query(studentsQuery, [
            ...params,
            limit,
            offset,
        ])

        return {
            students,
            total: Number(totalResult.total),
        }
    }
}
