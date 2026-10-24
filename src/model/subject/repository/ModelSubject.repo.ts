import { injectable } from 'tsyringe'

import { AppDataSource } from '../../../config/data-source'
import { ModelSubjectRepositoryMethods } from './ModelSubject.repoInterface'
import { ModelSubjectDTO } from '../controller/ModelSubject.DTO'
import { CourseInfo } from '../types/ModelSubject.types'
import { ResultSetHeader } from 'mysql2'
import { GetPaginationOptions } from '../../../constant/Result.types'
import { UpdateModelSubjectDTO } from '../controller/UpdateModelSubject.DTO'

@injectable()
export class ModelSubjectRepository implements ModelSubjectRepositoryMethods {
    addCourse = async (data: ModelSubjectDTO): Promise<ResultSetHeader> => {
        return AppDataSource.manager.query(
            `INSERT INTO sem_model_subject
     (  name,createdBy)
     VALUES (?,?)`,
            [data.getName(), data.getCreatedBy()]
        )
    }

    getAllCourse = async ({
        limit,
        offset,
        all = false,
        search,
    }: GetPaginationOptions): Promise<{
        courses: CourseInfo[]
        total: number
    }> => {
        const whereConditions: string[] = ['c.isDeleted = 0']
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
    SELECT 
    c.id as courseId,
        c.name as courseName
    FROM sem_model_subject c
       WHERE ${whereConditions.join(' AND ')}
             ORDER BY c.name ASC 
    ${paginationClause}
  `
        const courses = await AppDataSource.manager.query(coursesQuery, [
            ...params,
            ...paginationParams,
        ])

        const totalQuery = `
    SELECT COUNT(*) as total
    FROM sem_model_subject c
  WHERE ${whereConditions.join(' AND ')}
  `
        const totalResult = await AppDataSource.manager.query(
            totalQuery,
            params
        )
        const total = totalResult[0]?.total ?? 0
        return { courses, total }
    }

    updateCourse = async (
        data: UpdateModelSubjectDTO
    ): Promise<ResultSetHeader> => {
        let query = `
    UPDATE sem_model_subject SET
      name=COALESCE(?,name),
      updatedBy=COALESCE(?,updatedBy) where id=?
  `

        return AppDataSource.manager.query(query, [
            data.getName(),
            data.getUpdatedBy(),
            data.getId(),
        ])
    }
}
