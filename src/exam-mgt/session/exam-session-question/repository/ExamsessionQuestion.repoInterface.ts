import { ResultSetHeader } from 'mysql2'
import { QueryRunner } from 'typeorm'
import { ExamSessionQuestionDTO } from '../controller/ExamSessionQuestion.DTO'
import { ExamSessionQuestion } from '../types/ExamQuestion.types'

export interface ExamSessionQuestionRepositoryMethods {
    addExamSessionQuestions(
        questions: ExamSessionQuestionDTO[],
        queryRunner: QueryRunner
    ): Promise<ResultSetHeader>
    getExamQuestionBySessionId(
        examSessionId: number
    ): Promise<ExamSessionQuestion[]>
}
