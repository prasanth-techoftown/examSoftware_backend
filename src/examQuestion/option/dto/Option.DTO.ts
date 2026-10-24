export class OptionDTO {
    private readonly optionName: string
    private readonly isAnswer: boolean
    private readonly questionId: number
    private readonly createdBy: string

    constructor(
        optionName: string,
        isAnswer: boolean,
        questionId: number,
        createdBy: string
    ) {
        this.optionName = optionName
        this.isAnswer = isAnswer
        this.questionId = questionId
        this.createdBy = createdBy
    }
    getOptionName(): string {
        return this.optionName
    }
    getIsAnswer(): boolean {
        return this.isAnswer
    }
    getQuestionId(): number {
        return this.questionId
    }
    getCreatedBy(): string {
        return this.createdBy
    }
}
