export class UpdateCourseDTO {
    constructor(
        private readonly id: number,
        private readonly name: string,
        private readonly courseCode: string,
        private readonly description: string | null,
        private readonly durationInMonths: number,
        private readonly durationInHrs: number,
        private readonly courseCategoryId: number,
        private readonly isActive: number,
        private readonly updatedBy: string
    ) {}

    getId(): number {
        return this.id
    }
    getName(): string {
        return this.name
    }
    getCourseCode(): string {
        return this.courseCode
    }
    getDescription(): string | null {
        return this.description
    }
    getDurationInMonths(): number {
        return this.durationInMonths
    }
    getDurationInHrs(): number {
        return this.durationInHrs
    }
    getCourseCategoryId(): number {
        return this.courseCategoryId
    }
    getIsActive(): number {
        return this.isActive
    }
    getUpdatedBy(): string {
        return this.updatedBy
    }
}
