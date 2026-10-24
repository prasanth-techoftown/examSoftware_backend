import { Result, Status } from '../../constant/Result.types'

export type DateItem = {
    year: number
    month: number
    date: number
}

export type DateScheduleItem = {
    year: number
    month: number
    dates: number[]
}

export type DateScheduleRequestItem = {
    year: string
    month: string
    dates: string[]
}
export interface DateScheduleResult extends Result<Status> {
    DateSchedule?: DateScheduleItem[]
    total?: number
}
