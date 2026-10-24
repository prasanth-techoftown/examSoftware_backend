import { inject, injectable } from 'tsyringe'
import { CacheService } from '../../cache/ClearCache'
import { AppError } from '../../constant/App.error'
import { CACHE_KEYS, CACHE_TTL } from '../../cache/cache'
import { Status } from '../../constant/Result.types'
import { DateScheduleServiceMethods } from './DateSchedule.serviceInterface'
import { DateScheduleRepositoryMethods } from '../repository/DateSchedule.repoInterface'
import { DateScheduleDTO } from '../controller/DateSchedule.DTO'
import { DateScheduleResult } from '../types/DateSchedule.types'
@injectable()
export class DateScheduleService implements DateScheduleServiceMethods {
    constructor(
        @inject('DateScheduleRepository')
        private DateScheduleRepository: DateScheduleRepositoryMethods,

        private readonly clearCache: CacheService
    ) {}

    addDateSchedule = async (
        data: DateScheduleDTO
    ): Promise<DateScheduleResult> => {
        const schedules = data.getDateSchedule()
        const toRemove = data.getToRemove()

        const toAdd = schedules.flatMap((item) =>
            item.dates.map((d) => ({
                year: item.year,
                month: item.month,
                date: d,
                createdBy: data.getCreatedBy(),
            }))
        )

        try {
            if (toRemove.length) {
                await this.DateScheduleRepository.deleteDateSchedule(toRemove)
            }

            if (toAdd.length) {
                await this.DateScheduleRepository.addDateSchedule(toAdd)
            }

            await this.clearCache.delByPattern('dateScheduling')

            return { status: Status.SUCCESS }
        } catch (err) {
            console.log(err, 'err')
            if (err instanceof AppError) throw err
            throw new AppError('Failed to add DateSchedule', 500)
        }
    }

    getAllDateSchedule = async (year: string): Promise<DateScheduleResult> => {
        try {
            const cacheKey = CACHE_KEYS.DATE_SCHEDULE
            const cached =
                await this.clearCache.get<DateScheduleResult>(cacheKey)
            if (cached) return cached

            const data =
                await this.DateScheduleRepository.getAllDateSchedule(year)

            if (!data.DateSchedule.length) {
                return {
                    status: Status.NO_NAME_FOUND,
                    DateSchedule: [],
                    total: 0,
                }
            }

            const response: DateScheduleResult = {
                status: Status.SUCCESS,
                DateSchedule: data.DateSchedule,
                total: data.total ?? data.DateSchedule.length,
            }

            await this.clearCache.set(cacheKey, response, CACHE_TTL)

            return response
        } catch (error) {
            console.log(error, 'error')
            throw new AppError('Failed to fetch DateSchedule', 500)
        }
    }
}
