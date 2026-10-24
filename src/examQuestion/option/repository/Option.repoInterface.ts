import { ResultSetHeader } from 'mysql2'
import { QueryRunner } from 'typeorm'
import { updateOptionData } from '../../question/controller/UpdateQuestion.DTO'
import { optionData } from '../../question/types/Question.types'

export interface OptionRepositoryMethods {
    addOptions(
        data: optionData,
        queryRunner?: QueryRunner
    ): Promise<ResultSetHeader>
    updateOptions(
        data: updateOptionData,
        queryRunner?: QueryRunner
    ): Promise<ResultSetHeader>

    deleteOptions(
        id: number,
        deletedBy: string,
        queryRunner?: QueryRunner
    ): Promise<ResultSetHeader>
}
