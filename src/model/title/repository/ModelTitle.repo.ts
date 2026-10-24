import { injectable } from 'tsyringe'

import { AppDataSource } from '../../../config/data-source'
import { ModelTitleRepositoryMethods } from './ModelTitle.repoInterface'
import { ModelTitleDTO } from '../controller/ModelTitle.DTO'
import { CourseInfo } from '../types/ModelTitle.types'
import { UpdateModelTitleDTO } from '../controller/UpdateModelTitle.DTO'
import { ResultSetHeader } from 'mysql2'
import { GetPaginationOptions } from '../../../constant/Result.types'

@injectable()
export class ModelTitleRepository implements ModelTitleRepositoryMethods {
    addCourse = async (data: ModelTitleDTO): Promise<ResultSetHeader> => {
        return AppDataSource.manager.query(
            `INSERT INTO sem_model_title
     (  name, 
  createdBy)
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
        const whereConditions: string[] = ['isDeleted = 0']
        let paginationClause = ''
        const params = []
        const paginationParams = []

        if (search) {
            whereConditions.push('(LOWER(REPLACE(name," ","")) LIKE ? )')
            params.push(`%${search}%`)
        }
        if (!all && limit !== undefined && offset !== undefined) {
            paginationClause = ' LIMIT ? OFFSET ? '
            paginationParams.push(limit, offset)
        }

        const coursesQuery = `
    SELECT 
    id ,
        name 
    
    FROM sem_model_title 
       WHERE ${whereConditions.join(' AND ')}
             ORDER BY name ASC 
    ${paginationClause}
  `
        const courses = await AppDataSource.manager.query(coursesQuery, [
            ...params,
            ...paginationParams,
        ])

        const totalQuery = `
    SELECT COUNT(*) as total
    FROM sem_model_title 
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
        data: UpdateModelTitleDTO
    ): Promise<ResultSetHeader> => {
        let query = `
    UPDATE sem_model_title SET
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
