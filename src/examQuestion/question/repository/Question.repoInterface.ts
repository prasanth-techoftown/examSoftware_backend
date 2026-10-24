import { ResultSetHeader } from 'mysql2'
import { questionData, QuestionRow } from '../types/Question.types'
import { QuestionInputMode } from '../enums/Question.enum'
import { QueryRunner } from 'typeorm'
import { GetPaginationOptions } from '../../../constant/Result.types'

export interface QuestionRepositoryMethods {
    getAllQuestion(
        options: GetPaginationOptions,
        courseId: number
    ): Promise<{ question: questionData[]; total: number }>
    getQuestionById(
        id: number
    ): Promise<{ id: number; question: string } | null>
    getQuestionByAnswer(
        questionId: number,
        queryRunner: QueryRunner
    ): Promise<{ optionId: number }[]>
    getCourseByName(
        name: string,
        queryRunner?: QueryRunner
    ): Promise<{ id: number } | null>
    deleteQuestion(
        id: number,
        deletedBy: string,
        queryRunner: QueryRunner
    ): Promise<ResultSetHeader>
    addQuestion(
        data: {
            inputMode: QuestionInputMode
            question: string
            courseId: number
            createdBy: string
        },
        queryRunner?: QueryRunner
    ): Promise<ResultSetHeader>
    getQuestionByCourseId(courseId: number): Promise<QuestionRow[]>
    updateQuestion(
        data: { id: number; question: string; updatedBy: string },
        queryRunner?: QueryRunner
    ): Promise<ResultSetHeader>
}
