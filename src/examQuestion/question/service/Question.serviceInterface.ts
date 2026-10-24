import { QueryRunner } from 'typeorm'
import { GetPaginationOptions } from '../../../constant/Result.types'
import { QuestionDTO } from '../controller/Question.DTO'
import { UpdateQuestionDTO } from '../controller/UpdateQuestion.DTO'
import { QuestionResult } from '../types/Question.types'

export interface QuestionServiceMethods {
    getAllQuestion(
        options: GetPaginationOptions,
        courseId: number
    ): Promise<QuestionResult>

    addQuestion(
        question: QuestionDTO
        // courseData: StudentCourseDTO
    ): Promise<QuestionResult>
    updateQuestion(question: UpdateQuestionDTO): Promise<QuestionResult>
    getQuestionByAnswer(
        questionId: number,
        queryRunner: QueryRunner
    ): Promise<{ optionId: number }[]>
    deleteQuestion(id: number, deletedBy: string): Promise<QuestionResult>
}
