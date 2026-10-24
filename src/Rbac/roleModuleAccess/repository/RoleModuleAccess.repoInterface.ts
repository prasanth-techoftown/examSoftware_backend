import { ResultSetHeader } from 'mysql2'
import { RoleModuleDTO } from '../controller/RoleModuleAccess.DTO'
import { EntityManager } from 'typeorm'
import { RoleModuleAccessInfoRow } from '../types/RoleModule.types'

export interface RoleModuleAccessRepositoryMethod {
    addRoleModuleAccess(dto: RoleModuleDTO): Promise<ResultSetHeader>
    getRoleModuleAccess(): Promise<RoleModuleAccessInfoRow[]>
    getRoleModuleAccessById(id: string): Promise<RoleModuleAccessInfoRow[]>
    getRoleModuleAccessByRoleId(id: string): Promise<RoleModuleAccessInfoRow[]>
    getAccessIds(
        roleId: number,
        moduleId: number,
        manager?: EntityManager
    ): Promise<number[]>

    deleteAccess(
        roleId: number,
        moduleId: number,
        accessIds: number[],
        manager?: EntityManager
    ): Promise<ResultSetHeader>

    insertAccess(
        roleId: number,
        moduleId: number,
        accessIds: number[],
        updatedBy: string,
        manager?: EntityManager
    ): Promise<ResultSetHeader>
}
