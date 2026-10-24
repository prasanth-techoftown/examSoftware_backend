export class ExamSessionQuestionDTO {
    private readonly examSessionId: number
    private readonly questionId: number
    private readonly createdBy: string

    constructor(examSessionId: number, questionId: number, createdBy: string) {
        this.examSessionId = examSessionId
        this.questionId = questionId
        this.createdBy = createdBy
    }

    getExamSessionId() {
        return this.examSessionId
    }
    getQuestionId() {
        return this.questionId
    }
    getCreatedBy() {
        return this.createdBy
    }
}
