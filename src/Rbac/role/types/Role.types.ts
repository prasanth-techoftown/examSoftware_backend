import { Result, Status } from '../../../constant/Result.types'

export type RoleInfo = {
    name: string
    createdBy?: string
    level?: string
}
export enum RoleStatus {
    SUPER_ADMIN_NOT_ALLOWED = 'You cannot add or assign the Role',
    SYSTEM_ROLE_NOT_ALLOWED = 'You cannot add or assign system roles',
}

export interface RoleResult extends Result<Status | RoleStatus> {
    role?: RoleInfo[]
}
