import { ResultSetHeader } from 'mysql2'
import { RoleInfo } from '../types/Role.types'
import { UpdateRoleDTO } from '../controller/UpdateRole.DTO'
import { RoleDTO } from '../controller/Role.DTO'

export interface RoleRepositoryMethods {
    getAllRole(): Promise<{ role: RoleInfo[] }>
    addRole(data: RoleDTO): Promise<ResultSetHeader>
    updateRole(data: UpdateRoleDTO): Promise<ResultSetHeader>
}
