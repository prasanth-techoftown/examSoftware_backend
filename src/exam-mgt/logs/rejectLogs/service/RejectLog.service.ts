import { inject, injectable } from 'tsyringe'
import { CacheService } from '../../../../cache/ClearCache'
import { AppError } from '../../../../constant/App.error'
import { Status } from '../../../../constant/Result.types'
import { CommonRepository } from '../../../../common/repo/common.repo'
import { RejectLogServiceMethods } from './RejectLog.serviceInterface'
import { RejectLogRepositoryMethods } from '../repository/RejectLog.repoInterface'
import { UpdateExamRequestDTO } from '../../../examRequest/controller/UpdateExamRequest.DTO'
import { QueryRunner } from 'typeorm'

@injectable()
export class RejectLogService implements RejectLogServiceMethods {
    constructor(
        @inject('RejectLogRepository')
        private RejectLogRepository: RejectLogRepositoryMethods,
        @inject('CommonRepository') private commonRepository: CommonRepository,
        private clearCache: CacheService
    ) {}

    addRejectLog = async (
        data: UpdateExamRequestDTO,
        queryRunner: QueryRunner
    ) => {
        try {
            await this.RejectLogRepository.addRejectLog(data, queryRunner)
            await this.clearCache.delByPattern('rejectLog:')

            return { status: Status.SUCCESS }
        } catch (err) {
            console.log(err)

            if (err instanceof AppError) throw err
            throw new AppError('Failed to add Reject Logs', 500)
        }
    }
}
