import { ResultSetHeader } from 'mysql2'
import { DateItem, DateScheduleItem } from '../types/DateSchedule.types'

export interface DateScheduleRepositoryMethods {
    getAllDateSchedule(year: string): Promise<{
        DateSchedule: DateScheduleItem[]
        total: number
    }>

    addDateSchedule(
        data: { year: number; month: number; date: number; createdBy: string }[]
    ): Promise<ResultSetHeader>

    deleteDateSchedule(
        data: { year: number; month: number; date: number }[]
    ): Promise<void>

    findExistingDates(
        table: string,
        data: { year: number; month: number; date: number }[]
    ): Promise<DateItem[]>
}
