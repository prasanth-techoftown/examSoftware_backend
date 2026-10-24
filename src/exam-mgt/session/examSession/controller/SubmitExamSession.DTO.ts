export class SubmitExamSessionDTO {
    private readonly examSessionId: number
    private readonly submittedAt: string
    private readonly updatedBy: string
    constructor(examSessionId: number, submittedAt: string, updatedBy: string) {
        this.examSessionId = examSessionId
        this.submittedAt = submittedAt
        this.updatedBy = updatedBy
    }

    getexamSessionId(): number {
        return this.examSessionId
    }
    getSubmittedAt(): string {
        return this.submittedAt
    }

    getUpdatedBy(): string {
        return this.updatedBy
    }
}
