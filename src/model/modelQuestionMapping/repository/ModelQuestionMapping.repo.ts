import { injectable } from 'tsyringe'

import { AppDataSource } from '../../../config/data-source'
import { ResultSetHeader } from 'mysql2'
import { GetPaginationOptions } from '../../../constant/Result.types'
import { ModelQuestionMappingRepositoryMethods } from './ModelQuestionMapping.repoInterface'
import { GroupedCourse } from '../types/ModelQuestionMapping.types'

@injectable()
export class ModelQuestionMappingRepository implements ModelQuestionMappingRepositoryMethods {
    addModelQuestionMapping = async (
        titleId: number,
        subject: { modelSubjectId: number; subjectTotalQuestion: number },
        courseTotalQuestion: number,
        createdBy: string,
        time: number
    ): Promise<ResultSetHeader> => {
        return AppDataSource.manager.query(
            `INSERT INTO sem_model_question_mapping
         (titleId, subjectTotalQuestion, modelSubjectId, courseTotalQuestion, createdBy,time)
         VALUES (?, ?, ?, ?, ?,?)`,
            [
                titleId,
                subject.subjectTotalQuestion,
                subject.modelSubjectId,
                courseTotalQuestion,
                createdBy,
                time,
            ]
        )
    }

    getModelQuestionMapping = async ({
        limit,
        offset,
        all = false,
        search,
    }: GetPaginationOptions): Promise<{
        courses: GroupedCourse[]
        total: number
    }> => {
        const whereConditions: string[] = ['cem.isDeleted = 0']
        let paginationClause = ''
        const params = []
        const paginationParams = []

        if (search) {
            whereConditions.push('(LOWER(REPLACE(c.name, " ", "")) LIKE ?)')
            params.push(`%${search.toLowerCase()}%`)
        }
        if (!all && limit !== undefined && offset !== undefined) {
            paginationClause = ' LIMIT ? OFFSET ? '
            paginationParams.push(limit, offset)
        }

        const coursesQuery = `
                SELECT cem.id,
            cem.titleId,cem.subjectTotalQuestion,cem.modelSubjectId,cem.courseTotalQuestion,cem.time,
            c.name as subjectName,mt.name as titleName
                FROM sem_model_question_mapping cem
                LEFT JOIN sem_model_subject c
                ON c.id=cem.modelSubjectId
                LEFT JOIN sem_model_title mt
                ON mt.id=cem.titleId

           WHERE ${whereConditions.join(' AND ')}
                 ORDER BY mt.name ASC
        ${paginationClause}
      `
        const courses = await AppDataSource.manager.query(coursesQuery, [
            ...params,
            ...paginationParams,
        ])

        const groupedMap = new Map<number, GroupedCourse>()

        for (const row of courses) {
            if (!groupedMap.has(row.titleId)) {
                groupedMap.set(row.titleId, {
                    id: row.id,
                    titleId: row.titleId,
                    modelTitleName: row.titleName,
                    courseTotalQuestion: row.courseTotalQuestion,
                    time: row.time,
                    course: [],
                })
            }

            groupedMap.get(row.titleId)!.course.push({
                modelSubjectId: row.modelSubjectId,
                subjectName: row.subjectName,
                subjectTotalQuestion: row.subjectTotalQuestion,
            })
        }

        const groupedCourses = Array.from(groupedMap.values())
        const totalQuery = `
  SELECT COUNT(DISTINCT cem.titleId) as total
  FROM sem_model_question_mapping cem
      LEFT JOIN sem_model_title c ON c.id = cem.titleId
  WHERE ${whereConditions.join(' AND ')}
`
        const totalResult = await AppDataSource.manager.query(
            totalQuery,
            params
        )

        const total = totalResult[0]?.total ?? 0

        return {
            courses: groupedCourses,
            total,
        }
    }

    getSubjectByCourseId = async (
        id: number
    ): Promise<{ modelSubjectId: number }[]> => {
        return await AppDataSource.manager.query(
            `SELECT modelSubjectId FROM sem_model_question_mapping WHERE titleId = ?`,
            [id]
        )
    }
    insertSubject = async (
        titleId: number,
        subject: { modelSubjectId: number; subjectTotalQuestion: number },
        courseTotalQuestion: number,
        updatedBy: string,
        time: number
    ): Promise<ResultSetHeader> => {
        return AppDataSource.manager.query(
            `INSERT INTO sem_model_question_mapping
             (titleId, modelSubjectId, subjectTotalQuestion, courseTotalQuestion, updatedBy,time)
             VALUES (?, ?, ?, ?, ?,?)`,
            [
                titleId,
                subject.modelSubjectId,
                subject.subjectTotalQuestion,
                courseTotalQuestion,
                updatedBy,
                time,
            ]
        )
    }

    updateSubject(
        titleId: number,
        subject: { modelSubjectId: number; subjectTotalQuestion: number },
        courseTotalQuestion: number,
        updatedBy: string,
        time: number
    ): Promise<ResultSetHeader> {
        return AppDataSource.manager.query(
            `UPDATE sem_model_question_mapping SET
               subjectTotalQuestion = COALESCE(?, subjectTotalQuestion),
               courseTotalQuestion = COALESCE(?, courseTotalQuestion),
               updatedBy = COALESCE(?, updatedBy),  time = COALESCE(?, time)
             WHERE titleId = ? AND modelSubjectId = ?`,
            [
                subject.subjectTotalQuestion,
                courseTotalQuestion,
                updatedBy,
                time,
                titleId,
                subject.modelSubjectId,
            ]
        )
    }

    deleteSubjects = async (
        titleId: number,
        modelSubjectIds: number[]
    ): Promise<ResultSetHeader> => {
        if (modelSubjectIds.length === 0)
            return Promise.resolve({ affectedRows: 0 } as ResultSetHeader)
        return AppDataSource.manager.query(
            `DELETE FROM sem_model_question_mapping
             WHERE titleId = ? AND modelSubjectId IN (?)`,
            [titleId, modelSubjectIds]
        )
    }
}
