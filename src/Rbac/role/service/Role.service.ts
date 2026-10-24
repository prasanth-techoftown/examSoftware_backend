import { inject, injectable } from 'tsyringe'
import { RoleResult, RoleStatus } from '../types/Role.types'
import { RoleServiceMethods } from './Role.serviceInterface'
import { CommonRepository } from '../../../common/repo/common.repo'
import { CacheService } from '../../../cache/ClearCache'
import { AppError } from '../../../constant/App.error'
import { CACHE_KEYS, CACHE_TTL } from '../../../cache/cache'
import { RoleRepositoryMethods } from '../repository/Role.repoInterface'
import { RoleDTO } from '../controller/Role.DTO'
import { Status } from '../../../constant/Result.types'
import { UpdateRoleDTO } from '../controller/UpdateRole.DTO'
import {
    ROLE,
    RoleType,
    SystemRoleType,
} from '../../../constant/enum/Role.enum'

const SYSTEM_ROLES = [ROLE.SUPERADMIN, ROLE.STUDENT]
@injectable()
export class RoleService implements RoleServiceMethods {
    constructor(
        @inject('RoleRepository')
        private roleRepository: RoleRepositoryMethods,
        @inject('CommonRepository')
        private commonRepository: CommonRepository,
        private readonly clearCache: CacheService
    ) {}

    addRole = async (data: RoleDTO): Promise<RoleResult> => {
        try {
            const roleName = data.getName() as RoleType

            if (SYSTEM_ROLES.includes(roleName as SystemRoleType)) {
                return { status: RoleStatus.SYSTEM_ROLE_NOT_ALLOWED }
            }
            const existingRole = await this.commonRepository.existsActiveRecord(
                'sem_role',
                { name: data.getName() }
            )

            if (existingRole) {
                return { status: Status.NAME_ALREADY_EXIST }
            }

            await this.roleRepository.addRole(data)

            await this.clearCache.delByPattern('role:')
            await this.clearCache.delByPattern('roleModuleAccess:')

            return { status: Status.SUCCESS }
        } catch (err) {
            console.log(err)

            if (err instanceof AppError) throw err
            throw new AppError('Failed to add role', 500)
        }
    }

    getRole = async (): Promise<RoleResult> => {
        try {
            const cacheKey = CACHE_KEYS.ROLE_ALL
            const cached = await this.clearCache.get<RoleResult>(cacheKey)
            if (cached) return cached

            const data = await this.roleRepository.getAllRole()

            if (!data.role.length) {
                return { status: Status.NO_NAME_FOUND, role: [] }
            }

            const response: RoleResult = {
                status: Status.SUCCESS,
                role: data.role,
            }

            await this.clearCache.set(cacheKey, response, CACHE_TTL)
            return response
        } catch (err) {
            console.log(err)

            if (err instanceof AppError) throw err
            throw new AppError('Failed to fetch role', 500)
        }
    }

    updateRole = async (data: UpdateRoleDTO): Promise<RoleResult> => {
        try {
            const roleName = data.getName() as RoleType
            const normalizedRole = roleName.toUpperCase() as RoleType
            if (SYSTEM_ROLES.includes(normalizedRole as SystemRoleType)) {
                return { status: RoleStatus.SYSTEM_ROLE_NOT_ALLOWED }
            }
            const exisitingRole =
                await this.commonRepository.existsActiveRecord('sem_role', {
                    id: data.getId(),
                })

            if (!exisitingRole) {
                return { status: Status.NAME_NOT_EXIST }
            }
            const isDuplicateRole =
                await this.commonRepository.findActiveRecord('sem_role', {
                    id: data.getId(),
                    name: data.getName(),
                })
            if (isDuplicateRole !== null) {
                return { status: Status.NAME_ALREADY_EXIST }
            }
            await this.roleRepository.updateRole(data)
            await this.clearCache.delByPattern('role')
            await this.clearCache.delByPattern('roleModuleAccess:')

            return { status: Status.SUCCESS }
        } catch (err) {
            if (err instanceof AppError) throw err
            throw new AppError('Failed to update role', 500)
        }
    }
}
