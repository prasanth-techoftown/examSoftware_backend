import { RoleDTO } from '../controller/Role.DTO'
import { UpdateRoleDTO } from '../controller/UpdateRole.DTO'
import { RoleResult } from '../types/Role.types'

export interface RoleServiceMethods {
    getRole(): Promise<RoleResult>
    addRole(data: RoleDTO): Promise<RoleResult>
    updateRole(data: UpdateRoleDTO): Promise<RoleResult>
}
