import { injectable } from 'tsyringe'
import { ModuleRepoMethods } from './Module.repoInterface'
import { ModuleDTO } from '../controller/Module.DTO'
import { AppDataSource } from '../../../config/data-source'
import { UpdateModuleDTO } from '../controller/UpdateModule.DTO'
import { ResultSetHeader } from 'mysql2'
import { GetPaginationOptions } from '../../../constant/Result.types'
import { ModuleInfo } from '../types/FrontEndModules.types'

@injectable()
export class ModuleRepository implements ModuleRepoMethods {
    addModules = async (module: ModuleDTO): Promise<ResultSetHeader> => {
        return AppDataSource.manager.query(
            `INSERT into sem_frontendModule_tbl(name ,createdBy) VALUES(?,?)`,
            [module.getName(), module.getCreatedBy()]
        )
    }

    updateModules = async (
        updateModule: UpdateModuleDTO
    ): Promise<ResultSetHeader> => {
        const query = `
        UPDATE sem_frontendModule_tbl 
        SET name = COALESCE(?,name), updatedBy = COALESCE(?,updatedBy)
        WHERE id = ?`

        const params = [
            updateModule.getName(),
            updateModule.getUpdatedBy(),
            updateModule.getId(),
        ]

        return AppDataSource.manager.query(query, params)
    }

    getAllModules = async ({
        limit,
        offset,
        all = false,
    }: GetPaginationOptions): Promise<{
        module: ModuleInfo[]
        total?: number
    }> => {
        try {
            let query = `
      SELECT id, name
      FROM sem_frontendModule_tbl
      WHERE isDeleted = 0
      ORDER BY updatedAt
    `

            const values: number[] = []

            if (!all && limit !== undefined && offset !== undefined) {
                query += ` LIMIT ? OFFSET ?`
                values.push(limit, offset)
            }

            const modules = await AppDataSource.manager.query(query, values)

            if (all) {
                return { module: modules }
            }

            const countQuery = `
      SELECT COUNT(*) as total
      FROM sem_frontendModule_tbl
      WHERE isDeleted = 0
    `

            const totalResult = await AppDataSource.manager.query(countQuery)

            return {
                module: modules,
                total: totalResult[0].total,
            }
        } catch (err) {
            throw new Error(
                `Failed to fetch modules: ${(err as Error).message}`
            )
        }
    }
}
