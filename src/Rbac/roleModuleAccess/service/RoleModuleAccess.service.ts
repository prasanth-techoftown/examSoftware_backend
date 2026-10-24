import { inject, injectable } from 'tsyringe'
import { RoleModuleDTO } from '../controller/RoleModuleAccess.DTO'
import { UpdateRoleModuleDTO } from '../controller/UpdateModuleAccess.DTO'
import { CommonRepository } from '../../../common/repo/common.repo'
import { AppError } from '../../../constant/App.error'
import { RoleModuleAccessServiceMethods } from './RoleModuleAccess.serviceInterface'
import { Status } from '../../../constant/Result.types'
import {
    RoleModuleAccessInfo,
    RoleModuleAccessInfoRow,
    RoleModuleAccessResult,
} from '../types/RoleModule.types'
import { RoleModuleAccessRepositoryMethod } from '../repository/RoleModuleAccess.repoInterface'
import { AppDataSource } from '../../../config/data-source'
import { CACHE_KEYS, CACHE_TTL } from '../../../cache/cache'
import { CacheService } from '../../../cache/ClearCache'
import { updatePermissionsForRole } from '../../../redis/RedisSessionPermissionUpdater'
import { formatPermissionsFromRows } from '../../../utils/formatePermission'
import { getIO } from '../../../socketServer'

@injectable()
export class RoleModuleAccessService implements RoleModuleAccessServiceMethods {
    constructor(
        @inject('RoleModuleAccessRepository')
        private roleModuleRepo: RoleModuleAccessRepositoryMethod,
        @inject('CommonRepository') private commonRepository: CommonRepository,
        private clearCache: CacheService
    ) {}

    addRoleModuleAccess = async (
        roleModuleDto: RoleModuleDTO
    ): Promise<RoleModuleAccessResult> => {
        try {
            const roleId = roleModuleDto.getRoleId()
            const permissions = roleModuleDto.getPermissions()

            for (const permission of permissions) {
                const { moduleId, accessIds } = permission

                const existingRoleAccess =
                    await this.commonRepository.existsActiveRecord(
                        'sem_role_module_access_tbl',
                        {
                            role_id: roleId,
                            module_id: moduleId,
                            access_id: accessIds,
                        }
                    )
                if (existingRoleAccess) {
                    return { status: Status.NAME_ALREADY_EXIST }
                }
            }
            await this.roleModuleRepo.addRoleModuleAccess(roleModuleDto)
            await this.clearCache.delByPattern('role:')

            return {
                status: Status.SUCCESS,
            }
        } catch (err) {
            console.log(err, 'err')
            if (err instanceof AppError) throw err
            throw new AppError('Failed to add Role access', 500)
        }
    }

    updateRoleModuleAccess = async (
        dto: UpdateRoleModuleDTO
    ): Promise<RoleModuleAccessResult> => {
        try {
            const roleId = dto.getRoleId()
            const permissions = dto.getPermissions()
            const updatedBy = dto.getUpdatedBy()

            const existingModule =
                await this.commonRepository.existsActiveRecord(
                    'sem_role_module_access_tbl',
                    { role_id: roleId }
                )
            if (!existingModule) return { status: Status.NO_NAME_FOUND }

            await AppDataSource.transaction(async (manager) => {
                for (const perm of permissions) {
                    const moduleId = perm.moduleId
                    const incomingAccessIds = perm.accessIds

                    const existingAccessIds =
                        await this.roleModuleRepo.getAccessIds(
                            roleId,
                            moduleId,
                            manager
                        )

                    const toDelete = existingAccessIds.filter(
                        (id) => !incomingAccessIds.includes(id)
                    )
                    const toInsert = incomingAccessIds.filter(
                        (id) => !existingAccessIds.includes(id)
                    )

                    if (toDelete.length > 0) {
                        await this.roleModuleRepo.deleteAccess(
                            roleId,
                            moduleId,
                            toDelete,
                            manager
                        )
                    }

                    if (toInsert.length > 0) {
                        await this.roleModuleRepo.insertAccess(
                            roleId,
                            moduleId,
                            toInsert,
                            updatedBy,
                            manager
                        )
                    }
                }
            })
            await this.clearCache.delByPattern('role:')
            const rawRows =
                await this.roleModuleRepo.getRoleModuleAccessByRoleId(
                    String(roleId)
                )
            let roleName
            if (rawRows.length > 0) {
                const newFormattedPermissions =
                    formatPermissionsFromRows(rawRows)
                roleName = rawRows[0].roleName

                await updatePermissionsForRole(
                    roleName,
                    newFormattedPermissions
                )
                const io = getIO()
                io.emit('permissions:updated', { roleName })
            }

            return { status: Status.SUCCESS }
        } catch (err) {
            console.log('UPDATE ROLE MODULE ERROR:', err)
            if (err instanceof AppError) throw err
            throw new AppError('Failed to update role module access', 500)
        }
    }

    getRoleModuleAccess = async (): Promise<RoleModuleAccessResult> => {
        try {
            const cacheKey = CACHE_KEYS.ROLE_MODULE_ACCESS
            const cached =
                await this.clearCache.get<RoleModuleAccessResult>(cacheKey)
            if (cached) return cached
            const result = await this.roleModuleRepo.getRoleModuleAccess()
            if (result.length === 0) {
                return {
                    status: Status.NO_NAME_FOUND,
                    roleModuleAccess: [],
                }
            }
            const roleMap = new Map<
                number,
                {
                    roleId: number
                    roleName: string
                    modules: Map<
                        number,
                        {
                            moduleId: number
                            moduleName: string
                            access: {
                                roleModuleAccessId: number
                                accessId: number
                                accessName: string
                            }[]
                        }
                    >
                }
            >()

            result.forEach((row: RoleModuleAccessInfoRow) => {
                if (!roleMap.has(row.roleId)) {
                    roleMap.set(row.roleId, {
                        roleId: row.roleId,
                        roleName: row.roleName,
                        modules: new Map(),
                    })
                }

                const role = roleMap.get(row.roleId)!

                if (!role.modules.has(row.moduleId)) {
                    role.modules.set(row.moduleId, {
                        moduleId: row.moduleId,
                        moduleName: row.moduleName,
                        access: [],
                    })
                }

                const module = role.modules.get(row.moduleId)!

                module.access.push({
                    roleModuleAccessId: row.id,
                    accessId: row.accessId,
                    accessName: row.accessName,
                })
            })

            const flattened: RoleModuleAccessInfo[] = []
            roleMap.forEach((role) => {
                role.modules.forEach((module) => {
                    flattened.push({
                        rowId: `${role.roleId}-${module.moduleId}`,
                        roleId: role.roleId,
                        roleName: role.roleName,
                        moduleId: module.moduleId,
                        moduleName: module.moduleName,
                        access: module.access,
                    })
                })
            })

            const response = {
                status: Status.SUCCESS,
                roleModuleAccess: flattened,
            }

            await this.clearCache.set(cacheKey, response, CACHE_TTL)
            return response
        } catch (err) {
            console.log('RoleModuleService.getRoleModuleAccess ERROR:', err)
            throw new AppError('Failed to fetch Role Module Access', 500)
        }
    }
    getRoleModuleAccessById = async (
        id: string
    ): Promise<RoleModuleAccessResult> => {
        try {
            const cacheKey = CACHE_KEYS.ROLE_MODULE_ACCESS_BY_ID(id)
            const cached =
                await this.clearCache.get<RoleModuleAccessResult>(cacheKey)
            if (cached) return cached
            const result = await this.roleModuleRepo.getRoleModuleAccessById(id)
            if (result.length === 0) {
                return {
                    status: Status.NO_NAME_FOUND,
                    roleModuleAccess: [],
                }
            }
            const roleMap = new Map<
                number,
                {
                    roleId: number
                    roleName: string
                    modules: Map<
                        number,
                        {
                            moduleId: number
                            moduleName: string
                            access: {
                                roleModuleAccessId: number
                                accessId: number
                                accessName: string
                            }[]
                        }
                    >
                }
            >()

            result.forEach((row: RoleModuleAccessInfoRow) => {
                if (!roleMap.has(row.roleId)) {
                    roleMap.set(row.roleId, {
                        roleId: row.roleId,
                        roleName: row.roleName,
                        modules: new Map(),
                    })
                }

                const role = roleMap.get(row.roleId)!

                if (!role.modules.has(row.moduleId)) {
                    role.modules.set(row.moduleId, {
                        moduleId: row.moduleId,
                        moduleName: row.moduleName,
                        access: [],
                    })
                }

                const module = role.modules.get(row.moduleId)!

                module.access.push({
                    roleModuleAccessId: row.id,
                    accessId: row.accessId,
                    accessName: row.accessName,
                })
            })

            const flattened: RoleModuleAccessInfo[] = []
            roleMap.forEach((role) => {
                role.modules.forEach((module) => {
                    flattened.push({
                        rowId: `${role.roleId}-${module.moduleId}`,
                        roleId: role.roleId,
                        roleName: role.roleName,
                        moduleId: module.moduleId,
                        moduleName: module.moduleName,
                        access: module.access,
                    })
                })
            })

            const response = {
                status: Status.SUCCESS,
                roleModuleAccess: flattened,
            }

            await this.clearCache.set(cacheKey, response, CACHE_TTL)
            return response
        } catch (err) {
            console.log('RoleModuleService.getRoleModuleAccess ERROR:', err)
            throw new AppError('Failed to fetch Role Module Access', 500)
        }
    }
}
