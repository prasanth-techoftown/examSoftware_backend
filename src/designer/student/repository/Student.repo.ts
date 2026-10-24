import { injectable } from 'tsyringe'
import { StudentRepositoryMethods } from './Student.repoInterface'
import { BranchStudent, StudentInfo } from '../types/Student.types'
import { GetPaginationOptions } from '../../../constant/Result.types'
import { CertificateStatus } from '../../../certificate/certificateIssue/types/Certificate.types'
import { AppDataSource } from '../../../config/data-source'

@injectable()
export class StudentRepositoryForDesigner implements StudentRepositoryMethods {
    getStudentForDesigner = async (
        { limit, offset, all = false, search }: GetPaginationOptions,
        perBranchLimit: number
    ): Promise<{ student: StudentInfo[]; total: number }> => {
        const whereConditions: string[] = [`c.isDeleted = 0 AND c.status=?`]
        const params: (string | number)[] = [CertificateStatus.DESIGNER]

        if (search) {
            const cleanSearch = search.replace(/\s/g, '').toLowerCase()
            whereConditions.push(
                '(LOWER(REPLACE(af.firstName," ","")) LIKE ? OR LOWER(REPLACE(af.admissionNumber," ","")) LIKE ?)'
            )
            params.push(`%${cleanSearch}%`, `%${cleanSearch}%`)
        }

        const whereClause = whereConditions.join(' AND ')

        const totalBranchQuery = `
            SELECT COUNT(DISTINCT c.branchId) as total
            FROM certificate_tbl c
            LEFT JOIN admission_form af ON af.id = c.admissionId
            WHERE ${whereClause}
        `
        const totalBranchResult = await AppDataSource.manager.query(
            totalBranchQuery,
            params
        )

        const total = totalBranchResult[0]?.total ?? 0

        let branchPaginationClause = ''
        const branchPaginationParams: (string | number)[] = []
        if (!all && limit !== undefined && offset !== undefined) {
            branchPaginationClause = ' LIMIT ? OFFSET ? '
            branchPaginationParams.push(limit, offset)
        }

        const branchIdsQuery = `
            SELECT DISTINCT c.branchId, b.name as branchName
            FROM certificate_tbl c
            LEFT JOIN admission_form af ON af.id = c.admissionId
            LEFT JOIN branch b ON b.id = c.branchId
            WHERE ${whereClause}
            ORDER BY b.name ASC
            ${branchPaginationClause}
        `
        const branchRows = await AppDataSource.manager.query(branchIdsQuery, [
            ...params,
            ...branchPaginationParams,
        ])

        const branchIds = branchRows.map((r: any) => r.branchId)

        if (branchIds.length === 0) {
            return { student: [], total }
        }

        const branchIdPlaceholders = branchIds.map(() => '?').join(',')

        const trueTotalsQuery = `
            SELECT c.branchId, COUNT(*) as totalStudents
            FROM certificate_tbl c
            LEFT JOIN admission_form af ON af.id = c.admissionId
            WHERE ${whereClause} AND c.branchId IN (${branchIdPlaceholders})
            GROUP BY c.branchId
        `
        const trueTotalsRows = await AppDataSource.manager.query(
            trueTotalsQuery,
            [...params, ...branchIds]
        )
        const trueTotalsMap = new Map<string, number>(
            trueTotalsRows.map((r: any) => [
                r.branchId,
                Number(r.totalStudents),
            ])
        )

        const studentsQuery = `
            SELECT * FROM (
                SELECT
                    c.id, c.branchId, c.admissionId, c.completionDate, c.certificateId, c.issuedDate,
                    af.firstName, sess.grade, af.lastName, cc.name as course,
                    b.name as branchName, b.branchCode, af.admissionNumber,
                    cc.durationInMonths as duration,
                    ROW_NUMBER() OVER (
                        PARTITION BY c.branchId
                        ORDER BY af.firstName IS NULL, af.firstName ASC, c.id ASC
                    ) as rn
                FROM certificate_tbl c
                LEFT JOIN admission_form af ON af.id = c.admissionId
                LEFT JOIN branch b ON b.id = c.branchId
                LEFT JOIN sem_student ss ON ss.admissionNumber = af.admissionNumber AND ss.isDeleted = 0
                LEFT JOIN sem_exam_session sess ON sess.studentId = ss.id
                LEFT JOIN course cc ON af.courseId = cc.id
                WHERE ${whereClause} AND c.branchId IN (${branchIdPlaceholders})
            ) ranked
            WHERE rn <= ?
            ORDER BY branchName ASC, rn ASC
        `

        const student = await AppDataSource.manager.query(studentsQuery, [
            ...params,
            ...branchIds,
            perBranchLimit,
        ])

        const groupedMap = new Map<string, any>()

        for (const row of student) {
            if (!groupedMap.has(row.branchId)) {
                groupedMap.set(row.branchId, {
                    branchId: row.branchId,
                    branchName: row.branchName,
                    branchCode: row.branchCode,
                    totalStudents: trueTotalsMap.get(row.branchId) ?? 0, // ✅ true total, not capped count
                    students: [],
                })
            }

            const branch = groupedMap.get(row.branchId)

            branch.students.push({
                id: row.id,
                admissionNumber: row.admissionNumber,
                firstName: row.firstName,
                lastName: row.lastName,
                course: row.course,
                completionDate: row.completionDate,
                issuedDate: row.issuedDate,
                certificateId: row.certificateId,
                admissionId: row.admissionId,
                duration: row.duration,
                grade: row.grade,
            })
        }

        const grouped = Array.from(groupedMap.values())
        return { student: grouped, total }
    }

    getStudentsForBranch = async (
        branchId: string,
        {
            limit = 5,
            offset = 0,
            search,
        }: { limit?: number; offset?: number; search?: string }
    ): Promise<{ students: BranchStudent[]; total: number }> => {
        const whereConditions: string[] = [
            `c.isDeleted = 0 AND c.status=? AND c.branchId=?`,
        ]
        const params: (string | number)[] = [
            CertificateStatus.DESIGNER,
            branchId,
        ]

        if (search) {
            const cleanSearch = search.replace(/\s/g, '').toLowerCase()
            whereConditions.push(
                '(LOWER(REPLACE(af.firstName," ","")) LIKE ? OR LOWER(REPLACE(af.admissionNumber," ","")) LIKE ?)'
            )
            params.push(`%${cleanSearch}%`, `%${cleanSearch}%`)
        }

        const whereClause = whereConditions.join(' AND ')

        const totalQuery = `
            SELECT COUNT(*) as total
            FROM certificate_tbl c
            LEFT JOIN admission_form af ON af.id = c.admissionId
            WHERE ${whereClause}
        `
        const totalResult = await AppDataSource.manager.query(
            totalQuery,
            params
        )
        const total = totalResult[0]?.total ?? 0

        const studentsQuery = `
            SELECT
                c.id, c.branchId, c.admissionId, c.completionDate, c.certificateId, c.issuedDate,
                af.firstName, sess.grade, af.lastName, cc.name as course,
                af.admissionNumber, cc.durationInMonths as duration
            FROM certificate_tbl c
            LEFT JOIN admission_form af ON af.id = c.admissionId
            LEFT JOIN sem_student ss ON ss.admissionNumber = af.admissionNumber AND ss.isDeleted = 0
            LEFT JOIN sem_exam_session sess ON sess.studentId = ss.id
            LEFT JOIN course cc ON af.courseId = cc.id
            WHERE ${whereClause}
            ORDER BY af.firstName IS NULL, af.firstName ASC, c.id ASC
            LIMIT ? OFFSET ?
        `
        const students = await AppDataSource.manager.query(studentsQuery, [
            ...params,
            limit,
            offset,
        ])

        return { students, total }
    }
}
