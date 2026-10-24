import { injectable } from 'tsyringe'
import { ResultSetHeader } from 'mysql2'
import { CourseCategoryDTO } from '../controller/CourseCategory.DTO'
import { UpdateCourseCategoryDTO } from '../controller/UpdateCourseCategory.DTO'
import { CourseCategoryInfo } from '../types/CourseCategory.types'
import { CourseCategoryRepositoryMethods } from './CourseCategory.repoInterface'
import { AppDataSource } from '../../config/data-source'
import { GetPaginationOptions } from '../../constant/Result.types'

@injectable()
export class CourseCategoryRepository
    implements CourseCategoryRepositoryMethods
{
    addCourseCategory = async (
        data: CourseCategoryDTO
    ): Promise<ResultSetHeader> => {
        return AppDataSource.manager.query(
            `INSERT INTO sem_coursecategory (name, createdBy) VALUES (?, ?)`,
            [data.getName(), data.getCreatedBy()]
        )
    }

    updateCourseCategory = async (
        data: UpdateCourseCategoryDTO
    ): Promise<ResultSetHeader> => {
        return AppDataSource.manager.query(
            `UPDATE sem_coursecategory
             SET name = COALESCE(?, name), updatedBy = COALESCE(?, updatedBy)
             WHERE id = ? AND isDeleted = 0`,
            [data.getName(), data.getUpdatedBy(), data.getId()]
        )
    }

    getCourseCategory = async ({
        limit,
        offset,
        all = false,
    }: GetPaginationOptions): Promise<{
        courseCategory: CourseCategoryInfo[]
        total?: number
    }> => {
        try {
            let query = `
                SELECT cc.id, cc.name, u.firstName
                FROM sem_coursecategory cc
                LEFT JOIN sem_user u
                    ON u.id = COALESCE(cc.updatedBy, cc.createdBy)
                    AND u.isDeleted = 0
                WHERE cc.isDeleted = 0
                ORDER BY cc.name ASC
            `
            const values: number[] = []

            if (!all && limit !== undefined && offset !== undefined) {
                query += ` LIMIT ? OFFSET ?`
                values.push(limit, offset)
            }

            const courseCategory = await AppDataSource.manager.query(
                query,
                values
            )

            if (all) return { courseCategory }

            const totalResult = await AppDataSource.manager.query(
                `SELECT COUNT(*) AS total FROM sem_coursecategory WHERE isDeleted = 0`
            )

            return { courseCategory, total: Number(totalResult[0].total) }
        } catch (err) {
            throw new Error(
                `Failed to fetch course category: ${(err as Error).message}`
            )
        }
    }

    countActiveCourses = async (categoryId: number): Promise<number> => {
        const rows = await AppDataSource.manager.query(
            `SELECT COUNT(*) AS total FROM sem_course
             WHERE courseCategoryId = ? AND isDeleted = 0`,
            [categoryId]
        )
        return Number(rows[0].total)
    }

    deleteCourseCategory = async (
        id: number,
        deletedBy: string
    ): Promise<ResultSetHeader> => {
        return AppDataSource.manager.query(
            `UPDATE sem_coursecategory
             SET isDeleted = 1, deletedBy = ?, deletedAt = NOW()
             WHERE id = ? AND isDeleted = 0`,
            [deletedBy, id]
        )
    }
}
