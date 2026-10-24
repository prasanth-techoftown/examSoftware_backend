import { DateScheduleItem } from '../types/DateSchedule.types'

export class DateScheduleDTO {
    private readonly dateSchedule: DateScheduleItem[]
    private readonly createdBy: string
    private readonly toRemove: { year: number; month: number; date: number }[]

    constructor(
        dateSchedule: DateScheduleItem[],
        createdBy: string,
        toRemove: { year: number; month: number; date: number }[] = []
    ) {
        this.dateSchedule = dateSchedule
        this.createdBy = createdBy
        this.toRemove = toRemove
    }

    getDateSchedule(): DateScheduleItem[] {
        return this.dateSchedule
    }

    getCreatedBy(): string {
        return this.createdBy
    }

    getToRemove(): { year: number; month: number; date: number }[] {
        return this.toRemove
    }
}
