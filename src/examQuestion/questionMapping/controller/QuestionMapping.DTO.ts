type SubjectDTO = {
    questionCourseId: number
    subjectTotalQuestion: number
}

export class QuestionMappingDTO {
    private readonly crmCourseId: number
    private readonly courseTotalQuestion: number
    private readonly subject: SubjectDTO[]
    private readonly createdBy: string
    private readonly time: number

    constructor(
        crmCourseId: number,
        subjects: SubjectDTO[],
        courseTotalQuestion: number,
        createdBy: string,
        time: number
    ) {
        this.crmCourseId = crmCourseId
        this.subject = subjects
        this.courseTotalQuestion = courseTotalQuestion
        this.createdBy = createdBy
        this.time = time
    }

    getCrmCourseId(): number {
        return this.crmCourseId
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
