import { QuestionInputMode } from '../enums/Question.enum'
import { questionData } from '../types/Question.types'

export class QuestionDTO {
    private readonly courseId: number
    private readonly inputMode: QuestionInputMode
    private readonly question: questionData[]
    private readonly createdBy: string

    constructor(
        courseId: number,
        inputMode: QuestionInputMode,
        question: questionData[],
        createdBy: string
    ) {
        this.courseId = courseId
        this.inputMode = inputMode
        this.question = question
        this.createdBy = createdBy
    }

    getCourseId(): number {
        return this.courseId
    }
    getInputMode(): QuestionInputMode {
        return this.inputMode
    }
    getQuestion(): questionData[] {
        return this.question
    }
    getCreatedBy(): string {
        return this.createdBy
    }
}
