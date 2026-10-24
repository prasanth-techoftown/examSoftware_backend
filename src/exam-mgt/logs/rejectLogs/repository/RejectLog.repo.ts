import { ResultSetHeader } from 'mysql2'
import { RejectLogRepositoryMethods } from './RejectLog.repoInterface'
import { injectable } from 'tsyringe'
import { AppDataSource } from '../../../../config/data-source'
import { RejectLogRole } from '../types/RejectLogs.types'
import { UpdateExamRequestDTO } from '../../../examRequest/controller/UpdateExamRequest.DTO'
import { QueryRunner } from 'typeorm'

@injectable()
export class RejectLogRepository implements RejectLogRepositoryMethods {
    addRejectLog = async (
        data: UpdateExamRequestDTO,
        queryRunner: QueryRunner
    ): Promise<ResultSetHeader> => {
        const manager = queryRunner
            ? queryRunner.manager
            : AppDataSource.manager
        return manager.query(
            `INSERT INTO exam_student_reject_logs
             (admissionId,date,time,reason,createdBy,who)
             VALUES (?, ?, ?, ?, ?,?)`,
            [
                data.getAdmissionId(),
                data.getDate(),
                data.getTime(),
                data.getReason(),
                data.getUpdatedBy(),
                RejectLogRole.EXAM_PORTAL,
            ]
        )
    }
}
