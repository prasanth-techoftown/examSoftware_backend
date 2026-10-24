import { inject, injectable } from 'tsyringe'
import { AppError } from '../../../../constant/App.error'
import { ExamSessionQuestionDTO } from '../controller/ExamSessionQuestion.DTO'

import { ExamSessionQuestionRepositoryMethods } from '../repository/ExamsessionQuestion.repoInterface'
import { ExamSessionResult } from '../../examSession/types/ExamSession.types'
import { Status } from '../../../../constant/Result.types'
import { ExamSessionQuestionServiceMethods } from './ExamSessionQuestion.serviceInterface'
import { QueryRunner } from 'typeorm'
import { ExamQuestionResult } from '../types/ExamQuestion.types'

@injectable()
export class ExamSessionQuestionService implements ExamSessionQuestionServiceMethods {
    constructor(
        @inject('ExamSessionQuestionRepository')
        private examSessionQuestionRepository: ExamSessionQuestionRepositoryMethods
    ) {}

    addExamSessionQuestion = async (
        data: ExamSessionQuestionDTO[],
        queryRunner: QueryRunner
    ): Promise<ExamSessionResult> => {
        try {
            await this.examSessionQuestionRepository.addExamSessionQuestions(
                data,
                queryRunner
            )
            return { status: Status.SUCCESS }
        } catch (err) {
            console.log(err)
            throw new AppError('Failed to start exam session Question', 500)
        }
    }

    getExamQuestionBySessionId = async (
        sessionId: number
    ): Promise<ExamQuestionResult> => {
        try {
            const questions =
                await this.examSessionQuestionRepository.getExamQuestionBySessionId(
                    sessionId
                )
            if (!questions || questions.length === 0) {
                return {
                    status: Status.NO_NAME_FOUND,
                    questions: [],
                }
            }
            return { status: Status.SUCCESS, questions: questions }
        } catch (err) {
            console.log(err)
            throw new AppError('Fetch failed Questions', 500)
        }
    }
}
