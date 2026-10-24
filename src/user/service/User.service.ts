import { inject, injectable } from 'tsyringe'

import bcrypt from 'bcrypt'
import {
    UserInfo,
    UserRegistrationResult,
    UserStatus,
} from '../types/User.types'

import { UserServiceMethods } from './User.serviceInterface'
import { CommonRepository } from '../../common/repo/common.repo'
import { CACHE_KEYS } from '../../cache/cache'

import { QueryRunner } from 'typeorm'
import { CacheService } from '../../cache/ClearCache'
import { AppError } from '../../constant/App.error'
import { redisClient } from '../../redis/RedisClient'
import { generateSnowflakeId } from '../../utils/snowflake'
import { RandomPassword } from '../../utils/RandomPassword'
import { sendEmail } from '../../utils/email/SendEmail'
import { EmailTemplate } from '../../utils/email/EmailTemplate'
import { Status } from '../../constant/Result.types'
import { UserDTO } from '../controller/User.DTO'
import { UserRepositoryMethods } from '../repository/User.repoInterface'
import { UpdateUserDTO } from '../controller/UpdateUser.DTO'

@injectable()
export class UserService implements UserServiceMethods {
    constructor(
        @inject('UserRepository')
        private userRepository: UserRepositoryMethods,
        @inject('CommonRepository')
        private commonRepository: CommonRepository,
        private readonly clearCache: CacheService
    ) {}

    userRegistration = async (
        data: UserDTO,
        queryRunner?: QueryRunner
    ): Promise<UserRegistrationResult> => {
        try {
            const existingEmail =
                await this.commonRepository.existsActiveRecord('sem_user', {
                    email: data.getEmail(),
                })

            if (existingEmail) {
                return { status: UserStatus.USER_ALREADY_EXIST }
            }

            const existingUserName =
                await this.commonRepository.existsActiveRecord('sem_user', {
                    userName: data.getUserName(),
                })

            if (existingUserName) {
                return { status: UserStatus.USERNAME_ALREADY_EXIST }
            }

            const id = generateSnowflakeId()
            const randomPassword = RandomPassword(8)
            const hashedPassword = await bcrypt.hash(randomPassword, 10)

            await this.userRepository.userRegistration(
                id,

                hashedPassword,
                data,
                queryRunner
            )

            const emailTemplate = EmailTemplate({
                email: data.getEmail(),
                userName: data.getUserName(),
                password: randomPassword,
            })

            await sendEmail({
                to: data.getEmail(),
                subject: 'Login Credentials',
                message: emailTemplate,
            })

            const user: UserInfo = {
                id,
                firstName: data.getFirstName(),
                lastName: data.getLastName() ?? '',
                userName: data.getUserName(),
                email: data.getEmail(),
                roleId: data.getRoleId(),
                phoneNumber: data.getPhoneNumber(),
            }

            await this.clearCache.del(CACHE_KEYS.USER_ALL)

            return { status: Status.SUCCESS, user }
        } catch (err) {
            console.log(err, 'user service')

            if (err instanceof AppError) throw err
            throw new AppError('Failed to add user', 500)
        }
    }

    getUserById = async (userId: string): Promise<UserRegistrationResult> => {
        const cacheKey = CACHE_KEYS.USERDETAILS(userId)
        const cachedUser = await redisClient.get(cacheKey)
        if (cachedUser) return JSON.parse(cachedUser)

        const user = await this.commonRepository.existsActiveRecord(
            'sem_user',
            {
                id: userId,
            }
        )
        if (!user) {
            return {
                status: UserStatus.USER_NOT_FOUND,
            }
        }

        const existing = await this.userRepository.getUserById(userId)

        if (!existing || existing.length === 0) {
            return {
                status: UserStatus.USER_NOT_FOUND,
            }
        }

        return {
            status: Status.SUCCESS,
            user: existing[0],
        }
    }
    updatePassword = async (
        userId: string,
        oldPassword: string,
        newPassword: string
    ): Promise<UserRegistrationResult> => {
        try {
            if (oldPassword === newPassword) {
                return { status: UserStatus.DUPLICATE }
            }
            const users = await this.userRepository.findUserById(userId)
            const user = users[0]
            if (!user) {
                return { status: UserStatus.USER_NOT_FOUND }
            }
            const isMatch = await bcrypt.compare(oldPassword, user.password!)
            if (!isMatch)
                if (!isMatch) {
                    return { status: UserStatus.WRONG_PASSWORD }
                }

            const hashedPassword = await bcrypt.hash(newPassword, 10)
            await this.userRepository.updatePassword(userId, hashedPassword)

            return { status: Status.SUCCESS }
        } catch (err) {
            if (err instanceof AppError) throw err
            throw new AppError('Failed to Update Password', 500)
        }
    }
    updateUser = async (
        id: string,
        data: UpdateUserDTO,
        queryRunner: QueryRunner
    ): Promise<UserRegistrationResult> => {
        try {
            const existingUser = await this.userRepository.findUserById(id)

            if (!existingUser) {
                return { status: UserStatus.USER_NOT_FOUND }
            }

            const emailChanged = existingUser[0].email !== data.getEmail()

            let hashedPassword: string | null = null
            let randomPassword: string | null = null
            if (emailChanged) {
                randomPassword = RandomPassword(8)
                hashedPassword = await bcrypt.hash(randomPassword, 2)
            }
            await this.userRepository.updateUser(
                id,
                hashedPassword,
                data,
                queryRunner
            )

            if (emailChanged) {
                const emailTemplate = EmailTemplate({
                    email: data.getEmail(),
                    userName: data.getUserName(),
                    password: randomPassword ?? undefined,
                })

                await sendEmail({
                    to: data.getEmail(),
                    subject: 'Your email was updated',
                    message: emailTemplate,
                })
            }

            await this.clearCache.del(CACHE_KEYS.USER_ALL)

            return { status: Status.SUCCESS }
        } catch (err) {
            if (err instanceof AppError) throw err
            throw new AppError('Failed to update user', 500)
        }
    }

    deleteUser = async (
        id: string,
        deletedBy: string,
        queryRunner: QueryRunner
    ): Promise<UserRegistrationResult> => {
        const existing = await this.commonRepository.existsActiveRecord(
            'sem_user',
            { id: id }
        )
        if (!existing) {
            return { status: UserStatus.USER_NOT_FOUND }
        }

        await this.userRepository.deleteUser(id, deletedBy, queryRunner)
        await this.clearCache.del(CACHE_KEYS.USER_ALL)

        return { status: Status.SUCCESS }
    }
}
