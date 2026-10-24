import { injectable } from 'tsyringe'
import { GradeDTO } from '../controller/Grade.DTO'
import { AppDataSource } from '../../config/data-source'
import { UpdateGradeDTO } from '../controller/UpdateGrade.DTO'
import { ResultSetHeader } from 'mysql2'
import { GetPaginationOptions } from '../../constant/Result.types'
import { GradeRepositoryMethods } from './Grade.repoInterface'
import { GradeInfo } from '../types/Grade.types'

@injectable()
export class GradeRepository implements GradeRepositoryMethods {
    addGrade = async (module: GradeDTO): Promise<ResultSetHeader> => {
        return AppDataSource.manager.query(
            `INSERT into sem_grade(grade,minRange,maxRange ,createdBy) VALUES(?,?,?,?)`,
            [
                module.getGrade(),
                module.getMinRange(),
                module.getMaxRange(),
                module.getCreatedBy(),
            ]
        )
    }

    updateGrade = async (
        updateGrade: UpdateGradeDTO
    ): Promise<ResultSetHeader> => {
        const query = `
        UPDATE sem_grade 
        SET grade = COALESCE(?,grade),minRange = COALESCE(?,minRange),maxRange = COALESCE(?,maxRange), updatedBy = COALESCE(?,updatedBy)
        WHERE id = ?`

        const params = [
            updateGrade.getGrade(),
            updateGrade.getMinRange(),
            updateGrade.getMaxRange(),
            updateGrade.getUpdatedBy(),
            updateGrade.getId(),
        ]

        return AppDataSource.manager.query(query, params)
    }

    getGrade = async ({
        limit,
        offset,
        all = false,
    }: GetPaginationOptions): Promise<{
        grade: GradeInfo[]
        total?: number
    }> => {
        try {
            let query = `
      SELECT id, grade,minRange,maxRange
      FROM sem_grade
      WHERE isDeleted = 0
      ORDER BY updatedAt
    `

            const values: number[] = []

            if (!all && limit !== undefined && offset !== undefined) {
                query += ` LIMIT ? OFFSET ?`
                values.push(limit, offset)
            }

            const grade = await AppDataSource.manager.query(query, values)

            if (all) {
                return { grade: grade }
            }

            const countQuery = `
      SELECT COUNT(*) as total
      FROM sem_grade
      WHERE isDeleted = 0
    `

            const totalResult = await AppDataSource.manager.query(countQuery)

            return {
                grade: grade,
                total: totalResult[0].total,
            }
        } catch (err) {
            throw new Error(`Failed to fetch grade: ${(err as Error).message}`)
        }
    }

    checkRangeConflict = async (
        minMark: number,
        maxMark: number,
        excludeId?: number
    ): Promise<boolean> => {
        let query = `
        SELECT 1
        FROM sem_grade
        WHERE isDeleted = 0
          AND minRange <= ?
          AND maxRange >= ?
    `
        const values: number[] = [maxMark, minMark]

        if (excludeId) {
            query += ` AND id != ?`
            values.push(excludeId)
        }

        query += ` LIMIT 1`

        const rows = await AppDataSource.manager.query(query, values)

        return rows.length > 0
    }
}
