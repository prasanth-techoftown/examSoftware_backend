import { injectable } from 'tsyringe'

import { AppDataSource } from '../../../config/data-source'
import { QuestionMappingRepositoryMethods } from './QuestionMapping.repoInterface'
import { ResultSetHeader } from 'mysql2'
import { GetPaginationOptions } from '../../../constant/Result.types'
import {
    Course,
    CourseIdRow,
    GroupedCourse,
} from '../types/QuestionMapping.types'
import { SqlParam } from '../../../certificate/certificateIssue/types/Certificate.types'

@injectable()
export class QuestionMappingRepository implements QuestionMappingRepositoryMethods {
    addQuestionMapping = async (
        crmCourseId: number,
        subject: { questionCourseId: number; subjectTotalQuestion: number },
        courseTotalQuestion: number,
        createdBy: string,
        time: number
    ): Promise<ResultSetHeader> => {
        return AppDataSource.manager.query(
            `INSERT INTO sem_question_mapping
         (crmCourseId, subjectTotalQuestion, questionCourseId, courseTotalQuestion, createdBy,time)
         VALUES (?, ?, ?, ?, ?,?)`,
            [
                crmCourseId,
                subject.subjectTotalQuestion,
                subject.questionCourseId,
                courseTotalQuestion,
                createdBy,
                time,
            ]
        )
    }

    getQuestionMapping = async ({
        limit,
        offset,
        all = false,
        search,
    }: GetPaginationOptions): Promise<{
        courses: GroupedCourse[]
        total: number
    }> => {
        const whereConditions: string[] = ['cem.isDeleted = 0']
        const params: SqlParam[] = []

        if (search) {
            whereConditions.push('(LOWER(REPLACE(c.name, " ", "")) LIKE ?)')
            params.push(`%${search.toLowerCase()}%`)
        }

        const paginationParams: SqlParam[] = []

        if (!all && limit !== undefined && offset !== undefined) {
            paginationParams.push(limit, offset)
        }

        const courseIdsQuery = `
    SELECT
        cem.crmCourseId,
        c.name
    FROM sem_question_mapping cem
    LEFT JOIN sem_course c
        ON c.id = cem.crmCourseId
    WHERE cem.isDeleted = 0
    GROUP BY cem.crmCourseId, c.name
    ORDER BY c.name ASC
    LIMIT ? OFFSET ?
`

        const courseIdsResult = await AppDataSource.manager.query(
            courseIdsQuery,
            [...params, ...paginationParams]
        )

        const courseIds = courseIdsResult.map(
            (row: CourseIdRow) => row.crmCourseId
        )

        const totalQuery = `
        SELECT COUNT(DISTINCT cem.crmCourseId) as total
        FROM sem_question_mapping cem
        LEFT JOIN sem_course c
            ON c.id = cem.crmCourseId
        WHERE ${whereConditions.join(' AND ')}
    `

        const totalResult = await AppDataSource.manager.query(
            totalQuery,
            params
        )

        const total = Number(totalResult[0]?.total || 0)

        if (!courseIds.length) {
            return {
                courses: [],
                total,
            }
        }

        // Fetch all mappings for selected course ids
        const placeholders = courseIds.map(() => '?').join(',')

        const coursesQuery = `
        SELECT
            cem.id,
            cem.crmCourseId,
            cem.subjectTotalQuestion,
            cem.questionCourseId,
            cem.courseTotalQuestion,
            cem.time,
            c.name as crmCourseName,
            qc.name as questionCourseName
        FROM sem_question_mapping cem
        LEFT JOIN sem_course c
            ON c.id = cem.crmCourseId
        LEFT JOIN sem_questioncourse qc
            ON qc.id = cem.questionCourseId
        WHERE cem.isDeleted = 0
          AND cem.crmCourseId IN (${placeholders})
        ORDER BY c.name ASC
    `

        const courses = await AppDataSource.manager.query(
            coursesQuery,
            courseIds
        )

        const groupedMap = new Map<number, GroupedCourse>()

        for (const row of courses) {
            if (!groupedMap.has(row.crmCourseId)) {
                groupedMap.set(row.crmCourseId, {
                    id: row.id,
                    crmCourseId: row.crmCourseId,
                    crmCourseName: row.crmCourseName,
                    courseTotalQuestion: row.courseTotalQuestion,
                    time: row.time,
                    course: [],
                })
            }

            groupedMap.get(row.crmCourseId)!.course.push({
                questionCourseId: row.questionCourseId,
                questionCourseName: row.questionCourseName,
                subjectTotalQuestion: row.subjectTotalQuestion,
            })
        }

        const groupedCourses = Array.from(groupedMap.values())

        return {
            courses: groupedCourses,
            total,
        }
    }

    getExistingCrmCourse = async (): Promise<Course[]> => {
        return AppDataSource.manager.query(`
   SELECT DISTINCT
        cem.crmCourseId,
        c.name as course
    FROM sem_question_mapping cem
    LEFT JOIN sem_course c
        ON c.id = cem.crmCourseId
            AND c.isDeleted = 0
    WHERE cem.isDeleted = 0
`)
    }
    getSubjectByCourseId = async (
        id: number
    ): Promise<{ questionCourseId: number }[]> => {
        return await AppDataSource.manager.query(
            `SELECT questionCourseId FROM sem_question_mapping WHERE crmCourseId = ?`,
            [id]
        )
    }
    insertSubject = async (
        crmCourseId: number,
        subject: { questionCourseId: number; subjectTotalQuestion: number },
        courseTotalQuestion: number,
        updatedBy: string,
        time: number
    ): Promise<ResultSetHeader> => {
        return AppDataSource.manager.query(
            `INSERT INTO sem_question_mapping
             (crmCourseId, questionCourseId, subjectTotalQuestion, courseTotalQuestion, updatedBy,time)
             VALUES (?, ?, ?, ?, ?,?)`,
            [
                crmCourseId,
                subject.questionCourseId,
                subject.subjectTotalQuestion,
                courseTotalQuestion,
                updatedBy,
                time,
            ]
        )
    }

    updateSubject(
        crmCourseId: number,
        subject: { questionCourseId: number; subjectTotalQuestion: number },
        courseTotalQuestion: number,
        updatedBy: string,
        time: number
    ): Promise<ResultSetHeader> {
        return AppDataSource.manager.query(
            `UPDATE sem_question_mapping SET
               subjectTotalQuestion = COALESCE(?, subjectTotalQuestion),
               courseTotalQuestion = COALESCE(?, courseTotalQuestion),
               updatedBy = COALESCE(?, updatedBy),  time = COALESCE(?, time)
             WHERE crmCourseId = ? AND questionCourseId = ?`,
            [
                subject.subjectTotalQuestion,
                courseTotalQuestion,
                updatedBy,
                time,
                crmCourseId,
                subject.questionCourseId,
            ]
        )
    }

    deleteSubjects = async (
        crmCourseId: number,
        questionCourseIds: number[]
    ): Promise<ResultSetHeader> => {
        if (questionCourseIds.length === 0)
            return Promise.resolve({ affectedRows: 0 } as ResultSetHeader)
        return AppDataSource.manager.query(
            `DELETE FROM sem_question_mapping
             WHERE crmCourseId = ? AND questionCourseId IN (?)`,
            [crmCourseId, questionCourseIds]
        )
    }
}
