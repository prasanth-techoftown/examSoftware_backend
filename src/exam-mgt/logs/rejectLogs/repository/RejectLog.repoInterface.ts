import { ResultSetHeader } from 'mysql2'
import { UpdateExamRequestDTO } from '../../../examRequest/controller/UpdateExamRequest.DTO'
import { QueryRunner } from 'typeorm'

export interface RejectLogRepositoryMethods {
    addRejectLog(
        data: UpdateExamRequestDTO,
        queryRunner: QueryRunner
    ): Promise<ResultSetHeader>
}
