import { ResultSetHeader } from 'mysql2'
import { AppDataSource } from '../../../config/data-source'
import { RoleModuleDTO } from '../controller/RoleModuleAccess.DTO'
import { RoleModuleAccessRepositoryMethod } from './RoleModuleAccess.repoInterface'
import { AppError } from '../../../constant/App.error'
import { AccessRow, RoleModuleAccessInfoRow } from '../types/RoleModule.types'
import { EntityManager } from 'typeorm'

export class RoleModuleAccessRepository implements RoleModuleAccessRepositoryMethod {
    addRoleModuleAccess = async (
        dto: RoleModuleDTO
    ): Promise<ResultSetHeader> => {
        const roleId = dto.getRoleId()
        const createdBy = dto.getCreatedBy()

        const values: (string | number)[] = []
        const rows: string[] = []

        for (const permission of dto.getPermissions()) {
            const { moduleId, accessIds } = permission

            for (const accessId of accessIds) {
                rows.push('(?, ?, ?, ?)')
                values.push(roleId, moduleId, accessId, createdBy)
            }
        }

        if (rows.length === 0) {
            throw new AppError('No records to insert', 400)
        }

        const query = `
        INSERT INTO sem_role_module_access_tbl
        (role_id, module_id, access_id, createdBy)
        VALUES ${rows.join(', ')}
    `

        return await AppDataSource.manager.query(query, values)
    }

    getAccessIds = async (
        roleId: number,
        moduleId: number,
        manager?: EntityManager
    ): Promise<number[]> => {
        const managerToUse: EntityManager = manager ?? AppDataSource.manager

        const result: AccessRow[] = await managerToUse.query(
            `SELECT access_id 
         FROM sem_role_module_access_tbl
         WHERE role_id = ? AND module_id = ? AND isDeleted = 0`,
            [roleId, moduleId]
        )

        return result.map((r) => r.access_id)
    }
    deleteAccess = async (
        roleId: number,
        moduleId: number,
        accessIds: number[],
        manager?: EntityManager
    ): Promise<ResultSetHeader> => {
        if (accessIds.length === 0)
            return { affectedRows: 0 } as ResultSetHeader

        const managerToUse: EntityManager = manager ?? AppDataSource.manager
        const placeholders = accessIds.map(() => '?').join(',')

        return managerToUse.query(
            `DELETE FROM sem_role_module_access_tbl
         WHERE role_id=? AND module_id=? AND access_id IN (${placeholders})`,
            [roleId, moduleId, ...accessIds]
        )
    }
    insertAccess = async (
        roleId: number,
        moduleId: number,
        accessIds: number[],
        updatedBy: string,
        manager?: EntityManager
    ): Promise<ResultSetHeader> => {
        if (accessIds.length === 0)
            return { affectedRows: 0 } as ResultSetHeader
        const managerToUse: EntityManager = manager ?? AppDataSource.manager

        const values = accessIds.map(() => '(?,?,?,?)').join(',')
        const params: (string | number)[] = []
        accessIds.forEach((id) => params.push(roleId, moduleId, id, updatedBy))

        return managerToUse.query(
            `INSERT INTO sem_role_module_access_tbl 
         (role_id, module_id, access_id, updatedBy)
         VALUES ${values}`,
            params
        )
    }
    getRoleModuleAccess = async (): Promise<RoleModuleAccessInfoRow[]> => {
        let query = `
            SELECT
                rma.id AS id,
                r.id AS roleId,
                r.name AS roleName,
                m.id AS moduleId,
                m.name AS moduleName,
                a.id AS accessId,
                a.name AS accessName
            FROM sem_role_module_access_tbl rma
            LEFT JOIN sem_role r ON rma.role_id = r.id
            LEFT JOIN sem_frontendModule_tbl m ON rma.module_id = m.id
            LEFT JOIN sem_access_tbl a ON rma.access_id = a.id
            WHERE rma.isDeleted = 0
            ORDER BY r.id ASC, m.id ASC
        `

        const data = await AppDataSource.manager.query(query)

        return data
    }
    getRoleModuleAccessById = async (
        userId: string
    ): Promise<RoleModuleAccessInfoRow[]> => {
        const query = `
        SELECT
            rma.id AS id,
            r.id AS roleId,
            r.name AS roleName,
            m.id AS moduleId,
            m.name AS moduleName,
            a.id AS accessId,
            a.name AS accessName
        FROM sem_user u
        INNER JOIN sem_role r ON u.roleId = r.id AND r.isDeleted = 0
        INNER JOIN sem_role_module_access_tbl rma ON rma.role_id = r.id AND rma.isDeleted = 0
        LEFT JOIN sem_frontendModule_tbl m ON rma.module_id = m.id AND m.isDeleted = 0
        LEFT JOIN sem_access_tbl a ON rma.access_id = a.id 
        WHERE u.isDeleted = 0 AND u.id = ?
        ORDER BY r.id ASC, m.id ASC
    `

        const data = await AppDataSource.manager.query(query, [userId])
        return data
    }
    getRoleModuleAccessByRoleId = async (
        roleId: string
    ): Promise<RoleModuleAccessInfoRow[]> => {
        const query = `
        SELECT
            rma.id AS id,
            r.id AS roleId,
            r.name AS roleName,
            m.id AS moduleId,
            m.name AS moduleName,
            a.id AS accessId,
            a.name AS accessName
        FROM sem_role_module_access_tbl rma
        INNER JOIN sem_role r ON rma.role_id = r.id AND r.isDeleted = 0
        LEFT JOIN sem_frontendModule_tbl m ON rma.module_id = m.id AND m.isDeleted = 0
        LEFT JOIN sem_access_tbl a ON rma.access_id = a.id
        WHERE rma.isDeleted = 0 AND rma.role_id = ?
        ORDER BY r.id ASC, m.id ASC
    `
        const data = await AppDataSource.manager.query(query, [roleId])
        return data
    }
}
