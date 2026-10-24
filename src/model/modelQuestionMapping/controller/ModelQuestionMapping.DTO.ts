type SubjectDTO = {
    modelSubjectId: number
    subjectTotalQuestion: number
}

export class ModelQuestionMappingDTO {
    private readonly TitleId: number
    private readonly courseTotalQuestion: number
    private readonly subject: SubjectDTO[]
    private readonly createdBy: string
    private readonly time: number

    constructor(
        TitleId: number,
        subjects: SubjectDTO[],
        courseTotalQuestion: number,
        createdBy: string,
        time: number
    ) {
        this.TitleId = TitleId
        this.subject = subjects
        this.courseTotalQuestion = courseTotalQuestion
        this.createdBy = createdBy
        this.time = time
    }

    getTitleId(): number {
        return this.TitleId
    }

    getSubjects(): SubjectDTO[] {
        return this.subject
    }
    getTime(): number {
        return this.time
    }
    getCourseTotalQuestion(): number {
        return this.courseTotalQuestion
    }

    getCreatedBy(): string {
        return this.createdBy
    }
}
