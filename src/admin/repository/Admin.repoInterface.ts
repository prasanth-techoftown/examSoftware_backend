import { ResultSetHeader } from 'mysql2'
import { QueryRunner } from 'typeorm'
import { AdminInfo } from '../types/Admin.types'

export interface AdminRepositoryMethods {
    addAdmin(
        userId: string,
        createdBy: string,
        queryRunner?: QueryRunner
    ): Promise<ResultSetHeader>
    getAllAdmin(): Promise<AdminInfo[]>
    updateAdmin(
        id: string,
        updatedBy: string,
        queryRunner?: QueryRunner
    ): Promise<ResultSetHeader>
    deleteAdmin(
        id: string,
        deletedBy: string,
        queryRunner: QueryRunner
    ): Promise<ResultSetHeader>
    AdminIdExistOrNot(
        id: string,
        queryRunner?: QueryRunner
    ): Promise<AdminInfo[]>
    checkIfAdminIsDeleted(id: string): Promise<AdminInfo[]>
}
