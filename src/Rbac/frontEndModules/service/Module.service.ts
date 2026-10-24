import { injectable, inject } from 'tsyringe'
import { ModuleRepoMethods } from '../repository/Module.repoInterface'
import { ModuleDTO } from '../controller/Module.DTO'
import { ModuleServiceMethods } from './Module.serviceInterface'
import { CommonRepository } from '../../../common/repo/common.repo'
import { UpdateModuleDTO } from '../controller/UpdateModule.DTO'
import { AppError } from '../../../constant/App.error'
import { FrontEndModuleResult } from '../types/FrontEndModules.types'
import { GetPaginationOptions, Status } from '../../../constant/Result.types'
import { CacheService } from '../../../cache/ClearCache'
import { CACHE_KEYS, CACHE_TTL } from '../../../cache/cache'

@injectable()
export class ModuleService implements ModuleServiceMethods {
    constructor(
        @inject('ModuleRepository') private ModuleRepository: ModuleRepoMethods,
        @inject('CommonRepository') private commonRepository: CommonRepository,
        private clearCache: CacheService
    ) {}

    addModules = async (module: ModuleDTO): Promise<FrontEndModuleResult> => {
        try {
            const existingModule =
                await this.commonRepository.existsActiveRecord(
                    'sem_frontendModule_tbl',
                    { name: module.getName() }
                )

            if (existingModule) {
                return { status: Status.NAME_ALREADY_EXIST }
            }
            await this.ModuleRepository.addModules(module)
            await this.clearCache.delByPattern('module:')
            await this.clearCache.delByPattern('roleModuleAccess:')

            return { status: Status.SUCCESS }
        } catch (err) {
            if (err instanceof AppError) throw err
            throw new AppError('Failed to add module', 500)
        }
    }

    updateModules = async (
        updateModule: UpdateModuleDTO
    ): Promise<FrontEndModuleResult> => {
        try {
            const existingModule =
                await this.commonRepository.existsActiveRecord(
                    'sem_frontendModule_tbl',
                    { id: updateModule.getId() }
                )
            if (!existingModule) {
                return { status: Status.NAME_NOT_EXIST }
            }
            const duplicateModule =
                await this.commonRepository.findActiveRecord(
                    'sem_frontendModule_tbl',
                    { name: updateModule.getName(), id: updateModule.getId() }
                )
            if (duplicateModule !== null) {
                return { status: Status.NAME_ALREADY_EXIST }
            }

            await this.ModuleRepository.updateModules(updateModule)
            await this.clearCache.delByPattern('module:')
            await this.clearCache.delByPattern('roleModuleAccess:')

            return { status: Status.SUCCESS }
        } catch (err) {
            if (err instanceof AppError) throw err
            throw new AppError('Failed to update module', 500)
        }
    }

    getModules = async ({
        limit,
        offset,
        all,
    }: GetPaginationOptions): Promise<FrontEndModuleResult> => {
        try {
            let cacheKey = all
                ? CACHE_KEYS.MODULE_ALL
                : `module:global:${limit}:${offset}`

            const cached =
                await this.clearCache.get<FrontEndModuleResult>(cacheKey)
            if (cached) return cached
            const data = await this.ModuleRepository.getAllModules({
                limit,
                offset,
                all,
            })

            if (!data.module.length) {
                return {
                    status: Status.NO_NAME_FOUND,
                    module: [],
                    total: 0,
                }
            }

            const module = data.module ?? []

            const total = data.total ?? data.module.length

            const response: FrontEndModuleResult = {
                status: Status.SUCCESS,
                module: module,
                total,
            }
            await this.clearCache.set(cacheKey, response, CACHE_TTL)
            return response
        } catch (err) {
            console.log(err, 'Failed to fetch Modules')

            throw new AppError('Failed to fetch modules', 500)
        }
    }
}
