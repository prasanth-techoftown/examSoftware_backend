export class UpdateModuleDTO {
    private readonly id: number
    private readonly updatedBy: string
    private readonly name: string

    constructor(id: number, updatedBy: string, name: string) {
        this.id = id
        this.updatedBy = updatedBy
        this.name = name
    }
    getId(): number {
        return this.id
    }
    getUpdatedBy(): string {
        return this.updatedBy
    }
    getName(): string {
        return this.name
    }
}
