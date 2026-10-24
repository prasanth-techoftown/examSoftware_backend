import { injectable } from 'tsyringe'
import { AppDataSource } from '../../config/data-source'
import { QueryRunner } from 'typeorm'
import { AdminRepositoryMethods } from './Admin.repoInterface'
import { ResultSetHeader } from 'mysql2'
import { AdminInfo } from '../types/Admin.types'

@injectable()
export class AdminRepository implements AdminRepositoryMethods {
    addAdmin = async (
        userId: string,
        createdBy: string,
        queryRunner?: QueryRunner
    ): Promise<ResultSetHeader> => {
        const manager = queryRunner
            ? queryRunner.manager
            : AppDataSource.manager

        return manager.query(
            `INSERT INTO sem_admin 
        (userId, createdBy )
         VALUES (?,?)`,
            [userId, createdBy]
        )
    }
    getAllAdmin = async (): Promise<AdminInfo[]> => {
        const query = `SELECT a.id,  a.userId, 
              u.firstName,u.lastName, u.email,u.phoneNumber,u.userName, u.roleId,r.name as roleName
       FROM sem_admin a
       LEFT JOIN sem_user u ON u.id = a.userId 
       and u.isDeleted=0
       LEFT JOIN sem_role r ON r.id = u.roleId
       and r.isDeleted=0
       WHERE a.isDeleted = 0
       ORDER BY a.updatedAt DESC

  `
        return AppDataSource.manager.query(query)
    }

    updateAdmin = async (
        id: string,
        updatedBy: string,
        queryRunner?: QueryRunner
    ): Promise<ResultSetHeader> => {
        const query = `
        UPDATE sem_admin
        SET updatedBy = ?
        WHERE id = ?;
    `

        const values = [updatedBy, id]
        const manager = queryRunner
            ? queryRunner.manager
            : AppDataSource.manager

        return manager.query(query, values)
    }
    deleteAdmin = async (
        id: string,
        deletedBy: string,
        queryRunner: QueryRunner
    ): Promise<ResultSetHeader> => {
        let manager = queryRunner ? queryRunner.manager : AppDataSource.manager
        return manager.query(
            `UPDATE sem_admin
     SET isDeleted = 1 , deletedBy = ?
     WHERE  id = ? `,
            [deletedBy, id]
        )
    }

    checkIfAdminIsDeleted = async (id: string): Promise<AdminInfo[]> => {
        return AppDataSource.manager.query(
            `SELECT userId FROM sem_admin WHERE  id = ? and isDeleted=0`,
            [id]
        )
    }

    AdminIdExistOrNot = async (
        id: string,
        queryRunner?: QueryRunner
    ): Promise<AdminInfo[]> => {
        const manager = queryRunner
            ? queryRunner.manager
            : AppDataSource.manager

        return manager.query(
            `SELECT id,userId FROM sem_admin WHERE id = ? and isDeleted=0`,
            [id]
        )
    }
}
