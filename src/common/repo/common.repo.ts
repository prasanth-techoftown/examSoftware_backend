import { injectable } from 'tsyringe'
import { AppDataSource } from '../../config/data-source'
export type DbRecord = Record<string, string | number | boolean | null>

type DbValue = string | number | boolean | null
@injectable()
export class CommonRepository {
    existsActiveRecord = async (
        tableName: string,
        conditions: Record<string, unknown>
    ): Promise<boolean> => {
        try {
            const allConditions: Record<string, unknown> = {
                ...conditions,
                isDeleted: 0,
            }

            const whereClauses: string[] = []
            const values: DbValue[] = []

            for (const key of Object.keys(allConditions)) {
                const value = allConditions[key]
                if (Array.isArray(value)) {
                    if (value.length === 0) continue

                    const placeholders = value.map(() => '?').join(', ')
                    whereClauses.push(`${key} IN (${placeholders})`)
                    values.push(...(value as DbValue[]))
                    continue
                }
                if (typeof value === 'string') {
                    whereClauses.push(`LOWER(${key}) = LOWER(?)`)
                    values.push(value)
                } else {
                    whereClauses.push(`${key} = ?`)
                    values.push(value as DbValue)
                }
            }
            if (whereClauses.length === 0) return false
            const query = `
                    SELECT 1
                    FROM ${tableName}
                    WHERE ${whereClauses.join(' AND ')}
                    LIMIT 1
                `

            const rows = await AppDataSource.manager.query(query, values)

            return rows.length > 0
        } catch (error) {
            console.error('Error in findActiveRecord:', error)
            return false
        }
    }

    findActiveRecord = async <T extends DbRecord>(
        tableName: string,
        conditions: Record<string, DbValue>,
        columns: string[] = ['*']
    ): Promise<T | null> => {
        try {
            const whereClauses: string[] = ['isDeleted = 0']
            const values: DbValue[] = []

            for (const key of Object.keys(conditions)) {
                const value = conditions[key]

                if (key === 'id') {
                    whereClauses.push(`id != ?`)
                } else if (typeof value === 'string') {
                    whereClauses.push(`LOWER(${key}) = LOWER(?)`)
                } else {
                    whereClauses.push(`${key} = ?`)
                }

                values.push(value)
            }

            const query = `
        SELECT ${columns.join(', ')}
        FROM ${tableName}
        WHERE ${whereClauses.join(' AND ')}
        LIMIT 1
        `

            const rows = await AppDataSource.manager.query(query, values)

            return rows.length ? (rows[0] as T) : null
        } catch (error) {
            console.error('Error in findActiveRecord:', error)
            return null
        }
    }
}
