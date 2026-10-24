import { GetPaginationOptions } from '../../../constant/Result.types'
import { ModuleDTO } from '../controller/Module.DTO'
import { UpdateModuleDTO } from '../controller/UpdateModule.DTO'
import { FrontEndModuleResult } from '../types/FrontEndModules.types'

export interface ModuleServiceMethods {
    addModules(module: ModuleDTO): Promise<FrontEndModuleResult>
    updateModules(updateModule: UpdateModuleDTO): Promise<FrontEndModuleResult>
    getModules(options: GetPaginationOptions): Promise<FrontEndModuleResult>
}
