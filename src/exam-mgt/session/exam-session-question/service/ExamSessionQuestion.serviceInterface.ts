import { QueryRunner } from 'typeorm'
import { ExamSessionQuestionDTO } from '../controller/ExamSessionQuestion.DTO'
import { ExamSessionResult } from '../../examSession/types/ExamSession.types'
import { ExamQuestionResult } from '../types/ExamQuestion.types'

export interface ExamSessionQuestionServiceMethods {
    addExamSessionQuestion(
        examSessionDTO: ExamSessionQuestionDTO[],
        queryRunner: QueryRunner
    ): Promise<ExamSessionResult>
    getExamQuestionBySessionId(sessionId: number): Promise<ExamQuestionResult>
}
