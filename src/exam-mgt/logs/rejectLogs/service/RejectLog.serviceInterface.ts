import { QueryRunner } from 'typeorm'
import { UpdateExamRequestDTO } from '../../../examRequest/controller/UpdateExamRequest.DTO'

export interface RejectLogServiceMethods {
    addRejectLog(data: UpdateExamRequestDTO, queryRunner: QueryRunner): void
}
