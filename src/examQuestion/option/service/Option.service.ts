import { QueryRunner } from 'typeorm'
import { OptionRepository } from '../repository/Options.repo'
import { OptionRepositoryMethods } from '../repository/Option.repoInterface'
import { updateOptionData } from '../../question/controller/UpdateQuestion.DTO'
import { Status } from '../../../constant/Result.types'
import { optionData, QuestionResult } from '../../question/types/Question.types'
import { AppError } from '../../../constant/App.error'

export class OptionService {
    private static optionRepository: OptionRepositoryMethods =
        new OptionRepository()

    static addOptions = async (
        data: optionData,
        queryRunner?: QueryRunner
    ): Promise<QuestionResult> => {
        try {
            await this.optionRepository.addOptions(data, queryRunner)
            return { status: Status.SUCCESS }
        } catch (error) {
            console.log('Failed to add option:', error)
            throw new AppError('Failed to add option')
        }
    }

    static updateOptions = async (
        data: updateOptionData,
        queryRunner?: QueryRunner
    ): Promise<QuestionResult> => {
        try {
            await this.optionRepository.updateOptions(data, queryRunner)
            return { status: Status.SUCCESS }
        } catch (error) {
            console.log('Failed to update option:', error)
            return { status: Status.ERROR }
        }
    }

    static deleteOptions = async (
        id: number,
        deletedBy: string,
        queryRunner?: QueryRunner
    ): Promise<QuestionResult> => {
        try {
            await this.optionRepository.deleteOptions(
                id,
                deletedBy,
                queryRunner
            )
            return { status: Status.SUCCESS }
        } catch (error) {
            console.log('Failed to delete option:', error)
            return { status: Status.ERROR }
        }
    }
}
