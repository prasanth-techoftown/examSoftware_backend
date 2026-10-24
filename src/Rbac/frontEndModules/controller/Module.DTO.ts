export class ModuleDTO {
    private readonly name: string
    private readonly createdBy: string

    constructor(name: string, createdBy: string) {
        this.name = name
        this.createdBy = createdBy
    }

    getName(): string {
        return this.name
    }
    getCreatedBy(): string {
        return this.createdBy
    }
}
