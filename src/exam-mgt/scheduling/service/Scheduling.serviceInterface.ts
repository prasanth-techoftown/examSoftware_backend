import { QueryRunner } from 'typeorm'
import { GetPaginationOptions } from '../../../constant/Result.types'
import { SchedulingDTO } from '../controller/Scheduling.DTO'
import { SchedulingResult } from '../types/Scheduling.types'

export interface SchedulingServiceMethods {
    getAllScheduling(
        options: GetPaginationOptions,
        status: string
    ): Promise<SchedulingResult>
    addScheduling(
        data: SchedulingDTO,
        queryRunner?: QueryRunner
    ): Promise<SchedulingResult>
}
