export type updateOptionData = {
    optionId: number
    optionName: string
    isAnswer: boolean
    questionId: number
    updatedBy: string
}

export class UpdateQuestionDTO {
    private readonly id: number
    private readonly question: string
    private readonly courseId: number
    private readonly options: updateOptionData[]
    private readonly updatedBy: string

    constructor(
        id: number,
        updatedBy: string,
        question: string,
        options: updateOptionData[],
        courseId: number
    ) {
        this.id = id
        this.updatedBy = updatedBy
        this.question = question
        this.options = options
        this.courseId = courseId
    }

    getCourseId(): number {
        return this.courseId
    }

    getId(): number {
        return this.id
    }

    getQuestion(): string {
        return this.question
    }

    getUpdatedBy(): string {
        return this.updatedBy
    }

    getOptions(): updateOptionData[] {
        return this.options
    }
}
