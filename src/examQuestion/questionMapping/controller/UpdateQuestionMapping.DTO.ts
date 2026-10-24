type UpdateSubjectDTO = {
    questionCourseId: number
    subjectTotalQuestion: number
}

export class UpdateQuestionMappingDTO {
    private readonly id: number
    private readonly crmCourseId: number
    private readonly subjects: UpdateSubjectDTO[]
    private readonly courseTotalQuestion: number
    private readonly updatedBy: string
    private readonly time: number

    constructor(
        id: number,
        crmCourseId: number,
        subjects: UpdateSubjectDTO[],
        courseTotalQuestion: number,
        updatedBy: string,
        time: number
    ) {
        this.id = id
        this.crmCourseId = crmCourseId
        this.subjects = subjects
        this.courseTotalQuestion = courseTotalQuestion
        this.updatedBy = updatedBy
        this.time = time
    }

    getId(): number {
        return this.id
    }

    getCrmCourseId(): number {
        return this.crmCourseId
    }

    getTime(): number {
        return this.time
    }

    getSubjects(): UpdateSubjectDTO[] {
        return this.subjects
    }

    getCourseTotalQuestion(): number {
        return this.courseTotalQuestion
    }

    getUpdatedBy(): string {
        return this.updatedBy
    }
}
