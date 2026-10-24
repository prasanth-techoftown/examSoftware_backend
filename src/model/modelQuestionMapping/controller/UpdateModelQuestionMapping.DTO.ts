type UpdateSubjectDTO = {
    modelSubjectId: number
    subjectTotalQuestion: number
}

export class UpdateModelQuestionMappingDTO {
    private readonly id: number
    private readonly TitleId: number
    private readonly subjects: UpdateSubjectDTO[]
    private readonly courseTotalQuestion: number
    private readonly updatedBy: string
    private readonly time: number

    constructor(
        id: number,
        TitleId: number,
        subjects: UpdateSubjectDTO[],
        courseTotalQuestion: number,
        updatedBy: string,
        time: number
    ) {
        this.id = id
        this.TitleId = TitleId
        this.subjects = subjects
        this.courseTotalQuestion = courseTotalQuestion
        this.updatedBy = updatedBy
        this.time = time
    }

    getId(): number {
        return this.id
    }

    getTitleId(): number {
        return this.TitleId
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
