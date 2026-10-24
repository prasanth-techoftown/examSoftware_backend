import { ResultSetHeader } from 'mysql2'
import { UserInfo } from '../types/User.types'
import { QueryRunner } from 'typeorm'
import { UserDTO } from '../controller/User.DTO'
import { UpdateUserDTO } from '../controller/UpdateUser.DTO'

export interface UserRepositoryMethods {
    userRegistration(
        id: string,
        password: string,
        data: UserDTO,
        queryRunner?: QueryRunner
    ): Promise<ResultSetHeader>
    getUserById(userId: string): Promise<UserInfo[]>
    updatePassword(userId: string, password: string): Promise<ResultSetHeader>
    updateUser(
        id: string,
        password: string | null,
        data: UpdateUserDTO,
        queryRunner?: QueryRunner
    ): Promise<ResultSetHeader>
    deleteUser(
        id: string,
        deletedBy: string,
        queryRunner: QueryRunner
    ): Promise<ResultSetHeader>
    findUserById(userId: string): Promise<UserInfo[]>
}
