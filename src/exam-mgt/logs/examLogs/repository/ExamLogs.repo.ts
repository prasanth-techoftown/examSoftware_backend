import { ResultSetHeader } from 'mysql2'
import { ExamLogsDTO } from '../controller/ExamLogs.DTO'
import { injectable } from 'tsyringe'
import { ExamLogsRepositoryMethods } from './ExamLogs.repoInterface'
import { QueryRunner } from 'typeorm'
import { AppDataSource } from '../../../../config/data-source'

@injectable()
export class ExamLogsRepository implements ExamLogsRepositoryMethods {
    addExamLogs = async (
        data: ExamLogsDTO,
        queryRunner?: QueryRunner
    ): Promise<ResultSetHeader> => {
        const db = queryRunner ? queryRunner : AppDataSource
        return db.query(
            `INSERT INTO sem_exam_activity_log 
             (studentId, examSessionId, score,grade,percentage,result,action)
             VALUES (?, ?, ?, ?,?,?,?)`,
            [
                data.getStudentId(),
                data.getExamSessionId(),
                data.getScore(),
                data.getGrade(),
                data.getPercentage(),
                data.getResult(),
                data.getAction(),
            ]
        )
    }
    //     getAllRole = async (): Promise<{ExamLogs:ExamLogsInfo[] }> => {
    //         const query = `SELECT id,name,isSystemRole
    //     FROM sem_role
    //     WHERE isDeleted = 0
    //     ORDER BY updatedAt DESC

    //   `
    //         constExamLogss = await AppDataSource.manager.query(query)
    //         return {ExamLogs:ExamLogss }
    //     }
}
