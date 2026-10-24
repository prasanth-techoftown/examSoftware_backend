export interface PermissionItem {
    moduleId: number
    accessIds: number[]
}
export class RoleModuleDTO {
    private readonly roleId: number
    private readonly permissions: PermissionItem[]
    private readonly createdBy: string

    constructor(
        roleId: number,
        permissions: PermissionItem[],
        createdBy: string
    ) {
        this.roleId = roleId
        this.permissions = permissions
        this.createdBy = createdBy
    }

    getRoleId(): number {
        return this.roleId
    }
    getPermissions(): PermissionItem[] {
        return this.permissions
    }
    getCreatedBy(): string {
        return this.createdBy
    }
}
