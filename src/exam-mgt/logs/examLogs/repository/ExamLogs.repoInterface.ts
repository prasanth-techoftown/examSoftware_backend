import { ResultSetHeader } from 'mysql2'
import { ExamLogsDTO } from '../controller/ExamLogs.DTO'
import { QueryRunner } from 'typeorm'

export interface ExamLogsRepositoryMethods {
    // getAllExamLogs(): Promise<{ ExamLogs: ExamLogsInfo[] }>
    addExamLogs(
        data: ExamLogsDTO,
        queryRunner: QueryRunner
    ): Promise<ResultSetHeader>
}
