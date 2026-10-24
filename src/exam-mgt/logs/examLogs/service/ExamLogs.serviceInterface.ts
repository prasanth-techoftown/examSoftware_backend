import { QueryRunner } from 'typeorm'
import { ExamLogsDTO } from '../controller/ExamLogs.DTO'
import { ExamLogsResult } from '../types/ExamLogs.types'

export interface ExamLogsServiceMethods {
    // getExamLogs(): Promise<ExamLogsResult>
    addExamLogs(
        data: ExamLogsDTO,
        queryRunner?: QueryRunner
    ): Promise<ExamLogsResult>
}
