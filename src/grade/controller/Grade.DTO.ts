export class GradeDTO {
    private readonly grade: string
    private readonly minRange: number
    private readonly maxRange: number
    private readonly createdBy: string

    constructor(
        grade: string,
        minRange: number,
        maxRange: number,
        createdBy: string
    ) {
        this.grade = grade
        this.minRange = minRange
        this.maxRange = maxRange
        this.createdBy = createdBy
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
    getCreatedBy(): string {
        return this.createdBy
    }
}
