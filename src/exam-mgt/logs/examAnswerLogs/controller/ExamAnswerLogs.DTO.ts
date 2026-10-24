export class ExamAnswerLogDTO {
    private readonly answeredAt: string
    private readonly questionId: number
    private readonly optionId: number
    private readonly examSessionId: number
    private readonly createdBy: string

    constructor(
        answeredAt: string,
        questionId: number,
        optionId: number,
        examSessionId: number,
        createdBy: string
    ) {
        this.answeredAt = answeredAt
        this.questionId = questionId
        this.optionId = optionId
        this.examSessionId = examSessionId
        this.createdBy = createdBy
    }

    getAnsweredAt(): string {
        return this.answeredAt
    }

    getQuestionId(): number {
        return this.questionId
    }
    getOptionId(): number {
        return this.optionId
    }
    getCreatedBy(): string {
        return this.createdBy
    }
    getExamSessionId(): number {
        return this.examSessionId
    }
}
