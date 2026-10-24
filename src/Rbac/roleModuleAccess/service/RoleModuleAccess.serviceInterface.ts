import { RoleModuleDTO } from '../controller/RoleModuleAccess.DTO'
import { UpdateRoleModuleDTO } from '../controller/UpdateModuleAccess.DTO'
import { RoleModuleAccessResult } from '../types/RoleModule.types'

export interface RoleModuleAccessServiceMethods {
    addRoleModuleAccess(
        roleModuleDTO: RoleModuleDTO
    ): Promise<RoleModuleAccessResult>
    updateRoleModuleAccess(
        roleModuleDTO: UpdateRoleModuleDTO
    ): Promise<RoleModuleAccessResult>
    getRoleModuleAccess(): Promise<RoleModuleAccessResult>
    getRoleModuleAccessById(id: string): Promise<RoleModuleAccessResult>
}
