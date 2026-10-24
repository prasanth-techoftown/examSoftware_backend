import { Result, Status } from '../../../constant/Result.types'

export type RoleModuleAccessInfo = {
    rowId: string
    roleId: number
    roleName: string
    moduleId: number
    moduleName: string
    access: {
        roleModuleAccessId: number
        accessId: number
        accessName: string
    }[]
}
export type RoleModuleAccessInfoRow = {
    id: number
    roleId: number
    roleName: string
    moduleId: number
    moduleName: string
    accessId: number
    accessName: string
}
export type AccessRow = { access_id: number }
export interface RoleModuleAccessResult extends Result<Status> {
    roleModuleAccess?: RoleModuleAccessInfo[] | RoleModuleAccessInfoRow[]
}
