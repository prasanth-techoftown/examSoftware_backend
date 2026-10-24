export class UpdateGradeDTO {
    private readonly id: number
    private readonly grade: string
    private readonly minRange: number
    private readonly maxRange: number
    private readonly updatedBy: string

    constructor(
        id: number,
        grade: string,
        minRange: number,
        maxRange: number,
        updatedBy: string
    ) {
        this.id = id
        this.grade = grade
        this.minRange = minRange
        this.maxRange = maxRange
        this.updatedBy = updatedBy
    }
    getId(): number {
        return this.id
    }
    getGrade(): string {
        return this.grade
    }
    getMinRange(): number {
        return this.minRange
    }

    getMaxRange(): number {
        return this.maxRange
    }
    getUpdatedBy(): string {
        return this.updatedBy
    }
}
