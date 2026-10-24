import { inject, injectable } from 'tsyringe'
import { AppError } from '../../../../constant/App.error'

import { Status } from '../../../../constant/Result.types'
import { AppDataSource } from '../../../../config/data-source'
import { ExamAnswerResult } from '../types/ExamAnswerLogs.types'
import { ExamAnswerLogServiceMethods } from './ExamAnswerLogs.serviceInterface'
import { ExamAnswerLogRepositoryMethods } from '../repository/ExamAnswerLogs.repoInterface'
import { ExamAnswerLogDTO } from '../controller/ExamAnswerLogs.DTO'
import { QuestionServiceMethods } from '../../../../examQuestion/question/service/Question.serviceInterface'
@injectable()
export class ExamAnswerLogService implements ExamAnswerLogServiceMethods {
    constructor(
        @inject('ExamAnswerLogRepository')
        private examAnswerLogRepository: ExamAnswerLogRepositoryMethods,
        @inject('QuestionService')
        private questionService: QuestionServiceMethods
    ) {}

    addAnswerLog = async (
        data: ExamAnswerLogDTO
    ): Promise<ExamAnswerResult> => {
        const queryRunner = AppDataSource.createQueryRunner()

        await queryRunner.connect()
        await queryRunner.startTransaction()

        try {
            const correctOption =
                await this.questionService.getQuestionByAnswer(
                    data.getQuestionId(),
                    queryRunner
                )

            if (!correctOption) {
                throw new AppError(
                    'Correct answer not found for this question',
                    404
                )
            }

            const correctOptionId = Number(correctOption[0].optionId)

            const selectedOptionId = Number(data.getOptionId())

            const isCorrect = correctOptionId === selectedOptionId ? 1 : 0

            await this.examAnswerLogRepository.addAnswerLog(
                data,
                isCorrect,
                queryRunner
            )

            await queryRunner.commitTransaction()

            return {
                status: Status.SUCCESS,
            }
        } catch (err) {
            await queryRunner.rollbackTransaction()
            console.log(err)

            if (err instanceof AppError) throw err
            throw new AppError('Failed to add answer log', 500)
        } finally {
            await queryRunner.release()
        }
    }
    getSavedAnswers = async (
        sessionId: number
    ): Promise<
        { questionId: number; sessionQuestionId: number; optionId: number }[]
    > => {
        return this.examAnswerLogRepository.getSavedAnswersBySessionId(
            sessionId
        )
    }
}
