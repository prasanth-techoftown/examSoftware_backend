import { QueryRunner } from 'typeorm'
import { ResultSetHeader } from 'mysql2'
import { AppDataSource } from '../../../config/data-source'
import { OptionRepositoryMethods } from './Option.repoInterface'
import { updateOptionData } from '../../question/controller/UpdateQuestion.DTO'
import { optionData } from '../../question/types/Question.types'

export class OptionRepository implements OptionRepositoryMethods {
    addOptions = async (
        data: optionData,
        queryRunner?: QueryRunner
    ): Promise<ResultSetHeader> => {
        const manager = queryRunner
            ? queryRunner.manager
            : AppDataSource.manager
        const query = `INSERT INTO options (name, isAnswer, questionId, createdBy) VALUES (?, ?, ?, ?)`
        return manager.query(query, [
            data.optionName,
            data.isAnswer,
            data.questionId,
            data.createdBy,
        ])
    }

    updateOptions = async (
        data: updateOptionData,
        queryRunner?: QueryRunner
    ): Promise<ResultSetHeader> => {
        const manager = queryRunner
            ? queryRunner.manager
            : AppDataSource.manager
        const query = `
            UPDATE options
            SET
              name = COALESCE(?, name),
              isAnswer = COALESCE(?, isAnswer),
              updatedBy = COALESCE(?, updatedBy),
               updatedAt = NOW()
            WHERE id = ?
        `
        return manager.query(query, [
            data.optionName,
            data.isAnswer,
            data.updatedBy,
            data.optionId,
        ])
    }

    deleteOptions = async (
        id: number,
        deletedBy: string,
        queryRunner?: QueryRunner
    ): Promise<ResultSetHeader> => {
        const manager = queryRunner
            ? queryRunner.manager
            : AppDataSource.manager
        const query = `
            UPDATE options
            SET
           isDeleted=1,
              deletedBy = ?,
               deletedAt = NOW()
            WHERE questionId = ?
        `
        return manager.query(query, [deletedBy, id])
    }
}
