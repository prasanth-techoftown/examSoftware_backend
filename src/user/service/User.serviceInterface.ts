import { UpdateUserDTO } from '../controller/UpdateUser.DTO'
import { UserDTO } from '../controller/User.DTO'
import { UserRegistrationResult } from '../types/User.types'
import { QueryRunner } from 'typeorm'

export interface UserServiceMethods {
    userRegistration(
        data: UserDTO,
        queryRunner?: QueryRunner
    ): Promise<UserRegistrationResult>
    getUserById(userId: string): Promise<UserRegistrationResult>
    updatePassword(
        userId: string,
        oldPassword: string,
        newPassword: string
    ): Promise<UserRegistrationResult>
    updateUser(
        id: string,
        data: UpdateUserDTO,
        queryRunner: QueryRunner
    ): Promise<UserRegistrationResult>
    deleteUser(
        id: string,
        deletedBy: string,
        queryRunner?: QueryRunner
    ): Promise<UserRegistrationResult>
}
