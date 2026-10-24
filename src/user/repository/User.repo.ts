import { injectable } from 'tsyringe'
import { AppDataSource } from '../../config/data-source'
import { QueryRunner } from 'typeorm'
import { UserDTO } from '../controller/User.DTO'
import { UserRepositoryMethods } from './User.repoInterface'
import { UserInfo } from '../types/User.types'
import { UpdateUserDTO } from '../controller/UpdateUser.DTO'
import { ResultSetHeader } from 'mysql2'

@injectable()
export class UserRepository implements UserRepositoryMethods {
    userRegistration = async (
        id: string,
        password: string,
        data: UserDTO,
        queryRunner?: QueryRunner
    ): Promise<ResultSetHeader> => {
        const manager = queryRunner
            ? queryRunner.manager
            : AppDataSource.manager

        return manager.query(
            `INSERT INTO sem_user 
     (id, firstName, lastName,userName, email, password, createdBy, roleId, phoneNumber)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?,?)`,
            [
                id,
                data.getFirstName(),
                data.getLastName(),
                data.getUserName(),
                data.getEmail(),
                password,
                data.getCreatedBy(),
                data.getRoleId(),
                data.getPhoneNumber(),
            ]
        )
    }

    getUserById = async (userId: string): Promise<UserInfo[]> => {
        const query = `
  SELECT 
    u.firstName,u.lastName,
    u.email,u.userName,u.phoneNumber,
    u.id
FROM sem_user u
LEFT JOIN sem_role 
    ON sem_role.id = u.roleId
    and sem_role.isDeleted = 0
WHERE u.isDeleted = 0 and u.id=?
ORDER BY u.updatedAt DESC
  `
        return AppDataSource.manager.query(query, [userId])
    }

    findUserById = async (userId: string): Promise<UserInfo[]> => {
        const result = await AppDataSource.query(
            `
      SELECT 
        id,
        password,email
      FROM sem_user
      WHERE id = ? and isDeleted=0
      LIMIT 1
      `,
            [userId]
        )

        return result
    }

    updatePassword = async (
        userId: string,
        password: string
    ): Promise<ResultSetHeader> => {
        const result = await AppDataSource.query(
            `
      UPDATE sem_user
      SET password = ?, updatedAt = NOW()
      WHERE id = ?
      `,
            [password, userId]
        )

        return result
    }
    updateUser = async (
        id: string,
        password: string | null,
        data: UpdateUserDTO,
        queryRunner?: QueryRunner
    ) => {
        const manager = queryRunner
            ? queryRunner.manager
            : AppDataSource.manager

        const query = `
    UPDATE sem_user
    SET firstName = COALESCE(?,firstName),
        lastName = COALESCE(?,lastName),
        userName=COALESCE(?,userName),
        password=COALESCE(?,password),
        email = COALESCE(?,email),
        roleId = COALESCE(?,roleId),
        phoneNumber = COALESCE(?,phoneNumber),
        updatedBy =COALESCE(?,updatedBy)
    WHERE id = ?;
  `

        const values = [
            data.getFirstName(),
            data.getLastName(),
            data.getUserName(),
            password,
            data.getEmail(),
            data.getRoleId(),
            data.getPhoneNumber(),
            data.getUpdatedBy(),
            id,
        ]

        return manager.query(query, values)
    }
    deleteUser = async (
        id: string,
        deletedBy: string,
        queryRunner: QueryRunner
    ): Promise<ResultSetHeader> => {
        const manager = queryRunner
            ? queryRunner.manager
            : AppDataSource.manager

        return manager.query(
            `UPDATE sem_user
     SET isDeleted = 1 , deletedBy = ?
     WHERE id = ?`,
            [deletedBy, id]
        )
    }
}
