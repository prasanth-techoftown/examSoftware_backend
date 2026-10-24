import { DateScheduleDTO } from '../controller/DateSchedule.DTO'
import { DateScheduleResult } from '../types/DateSchedule.types'

export interface DateScheduleServiceMethods {
    getAllDateSchedule(year: string): Promise<DateScheduleResult>
    addDateSchedule(data: DateScheduleDTO): Promise<DateScheduleResult>
}
