import { injectable } from 'tsyringe'
import { AppDataSource } from '../../config/data-source'
import { ResultSetHeader } from 'mysql2'
import { DateScheduleRepositoryMethods } from './DateSchedule.repoInterface'
import { DateItem, DateScheduleItem } from '../types/DateSchedule.types'

@injectable()
export class DateScheduleRepository implements DateScheduleRepositoryMethods {
    addDateSchedule = async (
        data: { year: number; month: number; date: number; createdBy: string }[]
    ): Promise<ResultSetHeader> => {
        if (!data.length) {
            return { affectedRows: 0 } as ResultSetHeader
        }

        const values = data.map((d) => [d.year, d.month, d.date, d.createdBy])

        return AppDataSource.manager.query(
            `
      INSERT INTO sem_date_schedule
      (year, month, date, createdBy)
      VALUES ?
      `,
            [values]
        )
    }

    getAllDateSchedule = async (
        year: string,
        month?: string
    ): Promise<{
        DateSchedule: DateScheduleItem[]
        total: number
    }> => {
        let query = `
  
  SELECT date, month, year
  FROM sem_date_schedule
 WHERE isDeleted = 0
AND (year > YEAR(CURDATE())
 OR (year = YEAR(CURDATE()) AND month > MONTH(CURDATE()))
 OR (year = YEAR(CURDATE()) AND month = MONTH(CURDATE()) AND date >= DAY(CURDATE())))
`

        const params: (string | number)[] = []

        if (year) {
            query += ` AND year = ?`
            params.push(Number(year))
        }

        if (month) {
            query += ` AND month = ?`
            params.push(Number(month))
        }

        query += ` ORDER BY year, month, date`

        const raw = await AppDataSource.manager.query(query, params)

        const grouped: Record<
            string,
            { year: number; month: number; dates: number[] }
        > = {}

        for (const item of raw) {
            const key = `${item.year}-${item.month}`

            if (!grouped[key]) {
                grouped[key] = {
                    year: item.year,
                    month: item.month,
                    dates: [],
                }
            }

            grouped[key].dates.push(item.date)
        }

        return {
            DateSchedule: Object.values(grouped),
            total: Object.keys(grouped).length,
        }
    }

    findExistingDates = async (
        table: string,
        data: { year: number; month: number; date: number }[]
    ): Promise<DateItem[]> => {
        if (!data.length) return []

        const conditions = data
            .map(
                () => `(year = ? AND month = ? AND date = ? AND isDeleted = 0)`
            )
            .join(' OR ')

        const values = data.flatMap((d) => [d.year, d.month, d.date])

        return AppDataSource.manager.query(
            `
      SELECT year, month, date
      FROM ${table}
      WHERE ${conditions}
      `,
            values
        )
    }

    deleteDateSchedule = async (
        data: { year: number; month: number; date: number }[]
    ): Promise<void> => {
        if (!data.length) return
        const conditions = data
            .map(() => `(year = ? AND month = ? AND date = ?)`)
            .join(' OR ')

        const values = data.flatMap((d) => [d.year, d.month, d.date])

        await AppDataSource.manager.query(
            `
      DELETE FROM sem_date_schedule
      WHERE ${conditions}
      `,
            values
        )
    }
}
