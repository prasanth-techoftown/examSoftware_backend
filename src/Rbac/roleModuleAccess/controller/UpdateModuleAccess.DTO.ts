export interface PermissionItem {
    moduleId: number
    accessIds: number[]
}
export class UpdateRoleModuleDTO {
    private readonly id: number
    private readonly roleId: number
    readonly permissions: PermissionItem[]
    private readonly updatedBy: string

    constructor(
        id: number,
        roleId: number,
        permissions: PermissionItem[],
        updatedBy: string
    ) {
        this.id = id
        this.roleId = roleId
        this.permissions = permissions
        this.updatedBy = updatedBy
    }
    getId(): number {
        return this.id
    }
    getRoleId(): number {
        return this.roleId
    }
    getPermissions(): PermissionItem[] {
        return this.permissions
    }
    getUpdatedBy(): string {
        return this.updatedBy
    }
}
