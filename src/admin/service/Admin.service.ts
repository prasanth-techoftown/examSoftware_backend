import { inject, injectable } from 'tsyringe'
import { AdminInfo, AdminResult, AdminStatus } from '../types/Admin.types'
import { AppDataSource } from '../../config/data-source'
import { AdminServiceMethods } from './Admin.serviceInterface'
import { CommonRepository } from '../../common/repo/common.repo'
import { AppError } from '../../constant/App.error'
import { UserServiceMethods } from '../../user/service/User.serviceInterface'
import { CACHE_KEYS, CACHE_TTL } from '../../cache/cache'
import { CacheService } from '../../cache/ClearCache'
import { Status } from '../../constant/Result.types'
import { AdminRepositoryMethods } from '../repository/Admin.repoInterface'
import { UserDTO } from '../../user/controller/User.DTO'
import { UpdateUserDTO } from '../../user/controller/UpdateUser.DTO'

@injectable()
export class AdminService implements AdminServiceMethods {
    constructor(
        @inject('AdminRepository')
        private AdminRepository: AdminRepositoryMethods,
        @inject('UserService')
        private userService: UserServiceMethods,
        @inject('CommonRepository')
        private commonRepo: CommonRepository,
        private readonly clearCache: CacheService
    ) {}

    addAdmin = async (data: UserDTO): Promise<AdminResult> => {
        const queryRunner = AppDataSource.createQueryRunner()

        await queryRunner.connect()
        await queryRunner.startTransaction()
        try {
            const existingUser = await this.commonRepo.existsActiveRecord(
                'sem_user',
                { email: data.getEmail() }
            )
            if (existingUser) {
                await queryRunner.rollbackTransaction()
                return { status: AdminStatus.EMAIL_ALREADY_EXIST }
            }

            const existingPhoneNumber =
                await this.commonRepo.existsActiveRecord('sem_user', {
                    phoneNumber: data.getPhoneNumber(),
                })
            if (existingPhoneNumber) {
                await queryRunner.rollbackTransaction()
                return { status: AdminStatus.PHONENUMBER_EXIST }
            }

            const existingUserName = await this.commonRepo.existsActiveRecord(
                'sem_user',
                { userName: data.getUserName() }
            )
            if (existingUserName) {
                await queryRunner.rollbackTransaction()
                return { status: AdminStatus.USERNAME_ALREADY_EXIST }
            }

            const roleExists = await this.commonRepo.existsActiveRecord(
                'sem_role',
                {
                    id: data.getRoleId(),
                }
            )
            if (!roleExists) {
                return { status: AdminStatus.INVALID_ROLE }
            }

            const result = await this.userService.userRegistration(
                data,
                queryRunner
            )

            if (result.status !== Status.SUCCESS) {
                throw new AppError('User registration failed', 400)
            }

            const admin = await this.AdminRepository.addAdmin(
                result.user!.id,
                data.getCreatedBy(),
                queryRunner
            )
            await queryRunner.commitTransaction()

            const newAdmin: AdminInfo = {
                id: Number(admin.insertId),
                firstName: data.getFirstName(),
                lastName: data.getLastName() ?? '',
                userName: data.getUserName(),
                email: data.getEmail(),
                roleId: data.getRoleId(),
                phoneNumber: data.getPhoneNumber(),
                userId: result.user!.id,
            }
            await this.clearCache.del(CACHE_KEYS.ADMIN_ALL)

            return { status: Status.SUCCESS, admin: [newAdmin] }
        } catch (err) {
            await queryRunner.rollbackTransaction()
            console.log(err, 'err')

            if (err instanceof AppError) {
                throw err
            }

            throw new AppError('Failed to add admin', 500)
        } finally {
            await queryRunner.release()
        }
    }

    getAdmin = async (): Promise<AdminResult> => {
        try {
            const cacheKey = CACHE_KEYS.ADMIN_ALL

            const cached = await this.clearCache.get<AdminResult>(cacheKey)
            if (cached) return cached
            const existing = await this.AdminRepository.getAllAdmin()

            if (!existing || existing.length === 0) {
                return { status: Status.NO_NAME_FOUND, admin: [] }
            }
            const Admin: AdminInfo[] = existing.map((row: AdminInfo) => row)

            const response: AdminResult = {
                status: Status.SUCCESS,
                admin: Admin,
            }

            await this.clearCache.set(cacheKey, response, CACHE_TTL)
            return response
        } catch (err) {
            throw new AppError(
                `Fetch failed admin: ${err instanceof Error ? err.message : err}`,
                500
            )
        }
    }

    updateAdmin = async (data: UpdateUserDTO): Promise<AdminResult> => {
        const queryRunner = AppDataSource.createQueryRunner()
        await queryRunner.connect()
        await queryRunner.startTransaction()

        try {
            const existingAdmin = await this.AdminRepository.AdminIdExistOrNot(
                data.getId(),
                queryRunner
            )

            if (!existingAdmin.length) {
                return { status: Status.NAME_NOT_EXIST }
            }

            const userId = existingAdmin[0].userId

            const duplicateUser = await this.commonRepo.findActiveRecord(
                'sem_user',
                { email: data.getEmail(), id: userId }
            )

            const duplicateUserName = await this.commonRepo.findActiveRecord(
                'sem_user',
                { userName: data.getUserName(), id: userId }
            )

            if (duplicateUser !== null) {
                return { status: AdminStatus.EMAIL_ALREADY_EXIST }
            }

            if (duplicateUserName !== null) {
                return { status: AdminStatus.USERNAME_ALREADY_EXIST }
            }

            await this.userService.updateUser(userId, data, queryRunner)

            await this.AdminRepository.updateAdmin(
                data.getId(),
                data.getUpdatedBy(),
                queryRunner
            )

            await queryRunner.commitTransaction()
            await this.clearCache.del(CACHE_KEYS.ADMIN_ALL)

            return { status: Status.SUCCESS }
        } catch (err) {
            await queryRunner.rollbackTransaction()

            if (err instanceof AppError) throw err
            throw new AppError('Failed to update admin', 500)
        } finally {
            await queryRunner.release()
        }
    }

    deleteAdmin = async (
        AdminId: string,
        deletedBy: string
    ): Promise<AdminResult> => {
        const queryRunner = AppDataSource.createQueryRunner()
        await queryRunner.connect()
        await queryRunner.startTransaction()
        try {
            const AdminResult =
                await this.AdminRepository.checkIfAdminIsDeleted(AdminId)

            const Admin = AdminResult[0]
            if (!AdminResult.length) {
                return { status: Status.NAME_NOT_EXIST }
            }

            await this.AdminRepository.deleteAdmin(
                AdminId,
                deletedBy,
                queryRunner
            )

            await this.userService.deleteUser(
                Admin.userId,
                deletedBy,
                queryRunner
            )

            await queryRunner.commitTransaction()
            await this.clearCache.del(CACHE_KEYS.ADMIN_ALL)

            return { status: Status.SUCCESS }
        } catch (err) {
            await queryRunner.rollbackTransaction()

            if (err instanceof AppError) throw err
            throw new AppError('Failed to delete admin', 500)
        } finally {
            await queryRunner.release()
        }
    }
}
