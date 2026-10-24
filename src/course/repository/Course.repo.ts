import { injectable } from 'tsyringe'
import { ResultSetHeader } from 'mysql2'
import { CourseDTO } from '../controller/Course.DTO'
import { UpdateCourseDTO } from '../controller/UpdateCourse.DTO'
import { CourseInfo, CourseQueryOptions } from '../types/Course.types'
import { CourseRepositoryMethods } from './Course.repoInterface'
import { AppDataSource } from '../../config/data-source'

@injectable()
export class CourseRepository implements CourseRepositoryMethods {
    addCourse = async (data: CourseDTO): Promise<ResultSetHeader> => {
        return AppDataSource.manager.query(
            `INSERT INTO sem_course
                (name, courseCode, description, durationInMonths, durationInHrs,
                 courseCategoryId, isActive, createdBy)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                data.getName(),
                data.getCourseCode(),
                data.getDescription(),
                data.getDurationInMonths(),
                data.getDurationInHrs(),
                data.getCourseCategoryId(),
                data.getIsActive(),
                data.getCreatedBy(),
            ]
        )
    }

    updateCourse = async (data: UpdateCourseDTO): Promise<ResultSetHeader> => {
        return AppDataSource.manager.query(
            `UPDATE sem_course
             SET name = ?, courseCode = ?, description = ?,
                 durationInMonths = ?, durationInHrs = ?,
                 courseCategoryId = ?, isActive = ?, updatedBy = ?
             WHERE id = ? AND isDeleted = 0`,
            [
                data.getName(),
                data.getCourseCode(),
                data.getDescription(),
                data.getDurationInMonths(),
                data.getDurationInHrs(),
                data.getCourseCategoryId(),
                data.getIsActive(),
                data.getUpdatedBy(),
                data.getId(),
            ]
        )
    }

    getCourse = async ({
        limit,
        offset,
        all = false,
        search,
        courseCategoryId,
    }: CourseQueryOptions): Promise<{ Course: CourseInfo[]; total?: number }> => {
        try {
            const where: string[] = ['c.isDeleted = 0']
            const params: (string | number)[] = []

            if (courseCategoryId) {
                where.push('c.courseCategoryId = ?')
                params.push(courseCategoryId)
            }
            if (search) {
                where.push('(c.name LIKE ? OR c.courseCode LIKE ?)')
                params.push(`%${search}%`, `%${search}%`)
            }
            const whereSql = where.join(' AND ')

            let query = `
                SELECT c.id, c.courseCode, c.name AS courseName, c.description,
                       c.durationInMonths, c.durationInHrs, c.courseCategoryId,
                       cc.name AS courseCategory, c.isActive
                FROM sem_course c
                LEFT JOIN sem_coursecategory cc
                    ON cc.id = c.courseCategoryId AND cc.isDeleted = 0
                WHERE ${whereSql}
                ORDER BY c.name ASC
            `
            const values = [...params]
            if (!all && limit !== undefined && offset !== undefined) {
                query += ` LIMIT ? OFFSET ?`
                values.push(limit, offset)
            }

            const Course = await AppDataSource.manager.query(query, values)
            if (all) return { Course }

            const totalResult = await AppDataSource.manager.query(
                `SELECT COUNT(*) AS total FROM sem_course c WHERE ${whereSql}`,
                params
            )
            return { Course, total: Number(totalResult[0].total) }
        } catch (err) {
            throw new Error(`Failed to fetch course: ${(err as Error).message}`)
        }
    }

    deleteCourse = async (
        id: number,
        deletedBy: string
    ): Promise<ResultSetHeader> => {
        return AppDataSource.manager.query(
            `UPDATE sem_course
             SET isDeleted = 1, deletedBy = ?, deletedAt = NOW()
             WHERE id = ? AND isDeleted = 0`,
            [deletedBy, id]
        )
    }
}
