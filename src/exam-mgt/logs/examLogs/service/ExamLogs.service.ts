import { inject, injectable } from 'tsyringe'
import { ExamLogsResult } from '../types/ExamLogs.types'
import { ExamLogsServiceMethods } from './ExamLogs.serviceInterface'

import { ExamLogsRepositoryMethods } from '../repository/ExamLogs.repoInterface'
import { ExamLogsDTO } from '../controller/ExamLogs.DTO'
import { CacheService } from '../../../../cache/ClearCache'
import { Status } from '../../../../constant/Result.types'
import { AppError } from '../../../../constant/App.error'
import { QueryRunner } from 'typeorm'

@injectable()
export class ExamLogsService implements ExamLogsServiceMethods {
    constructor(
        @inject('ExamLogsRepository')
        private ExamLogsRepository: ExamLogsRepositoryMethods,
        private readonly clearCache: CacheService
    ) {}

    addExamLogs = async (
        data: ExamLogsDTO,
        queryRunner: QueryRunner
    ): Promise<ExamLogsResult> => {
        try {
            await this.ExamLogsRepository.addExamLogs(data, queryRunner)

            await this.clearCache.delByPattern('ExamLogs:')
            await this.clearCache.delByPattern('ExamLogsModuleAccess:')

            return { status: Status.SUCCESS }
        } catch (err) {
            console.log(err)

            if (err instanceof AppError) throw err
            throw new AppError('Failed to add ExamLogs', 500)
        }
    }

    // getExamLogs = async (): Promise<ExamLogsResult> => {
    //     try {
    //         const cacheKey = CACHE_KEYS.ExamLogs_ALL
    //         const cached = await this.clearCache.get<ExamLogsResult>(cacheKey)
    //         if (cached) return cached

    //         const data = await this.ExamLogsRepository.getAllExamLogs()

    //         if (!data.ExamLogs.length) {
    //             return { status: Status.NO_NAME_FOUND, ExamLogs: [] }
    //         }

    //         const response: ExamLogsResult = {
    //             status: Status.SUCCESS,
    //             ExamLogs: data.ExamLogs,
    //         }

    //         await this.clearCache.set(cacheKey, response, CACHE_TTL)
    //         return response
    //     } catch (err) {
    //         console.log(err)

    //         if (err instanceof AppError) throw err
    //         throw new AppError('Failed to fetch ExamLogs', 500)
    //     }
    // }
}
