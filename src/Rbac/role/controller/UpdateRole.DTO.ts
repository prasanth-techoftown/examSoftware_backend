export class UpdateRoleDTO {
    id: number
    name: string
    updatedBy: string

    constructor(id: number, name: string, updatedBy: string) {
        this.id = id
        this.name = name
        this.updatedBy = updatedBy
    }
    getId(): number {
        return this.id
    }
    getName(): string {
        return this.name
    }

    getUpdatedBy(): string {
        return this.updatedBy
    }
}
