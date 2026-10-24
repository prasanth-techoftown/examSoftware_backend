import { injectable } from 'tsyringe'
import { AppDataSource } from '../../../config/data-source'
import { CertificateRepositoryMethods } from './Certificate.repoInterface'
import { CertificateInfo, SqlParam } from '../types/Certificate.types'
import { GetPaginationOptions } from '../../../constant/Result.types'

@injectable()
export class CertificateRepository implements CertificateRepositoryMethods {
    getAllStudent = async ({
        limit,
        offset,
        all,
        search,
    }: GetPaginationOptions): Promise<{
        data: CertificateInfo[]
        total: number
    }> => {
        let whereClause = `WHERE ct.isDeleted = 0`
        let paginationClause = ''
        const params: SqlParam[] = []
        let paginationParams = []

        if (search) {
            whereClause += `
        AND (
            af.firstName LIKE ? OR
            af.lastName LIKE ? OR
            af.admissionNumber LIKE ? OR
            c.name LIKE ? OR
            ct.certificateId LIKE ?
        )`
            const searchValue = `%${search}%`
            params.push(
                searchValue,
                searchValue,
                searchValue,
                searchValue,
                searchValue
            )
        }
        if (!all && limit !== undefined && offset !== undefined) {
            paginationClause = ' LIMIT ? OFFSET ? '
            paginationParams.push(limit, offset)
        }

        const countQuery = `
        SELECT COUNT(*) as total
        FROM certificate_tbl ct
        LEFT JOIN admission_form af
            ON af.id = ct.admissionId AND af.isDeleted = 0
        LEFT JOIN course c
            ON af.courseId = c.id AND c.isDeleted = 0
        ${whereClause}
    `

        const totalResult = await AppDataSource.manager.query(
            countQuery,
            params
        )
        const total = Number(totalResult[0]?.total || 0)

        const dataQuery = `
        SELECT 
            ct.id,
            af.admissionNumber as registrationName,
            af.firstName,
            af.lastName,
            c.name AS courseName,
            ct.certificateId as certificateNo,
            b.name as branchName,
            b.branchCode,
            c.durationInMonths as duration,
            ses.grade,
            ct.completionDate,
            ct.issuedDate
        FROM certificate_tbl ct

        LEFT JOIN admission_form af
            ON af.id = ct.admissionId AND af.isDeleted = 0

        LEFT JOIN sem_student s
    ON s.admissionNumber = af.admissionNumber
    AND s.isDeleted = 0


       LEFT JOIN sem_exam_session ses 
 ON ses.studentId = s.id
     AND ses.isDeleted = 0
        LEFT JOIN branch b 
            ON b.id = af.branchId AND b.isDeleted = 0

        LEFT JOIN course c
            ON af.courseId = c.id AND c.isDeleted = 0

        ${whereClause}
        ORDER BY ct.id DESC
        ${paginationClause}
    `

        const data = await AppDataSource.manager.query(dataQuery, [
            ...params,
            ...paginationParams,
        ])

        return { data, total }
    }
}
