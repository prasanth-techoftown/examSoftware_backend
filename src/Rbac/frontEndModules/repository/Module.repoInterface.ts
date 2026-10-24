import { ResultSetHeader } from 'mysql2'
import { ModuleDTO } from '../controller/Module.DTO'
import { UpdateModuleDTO } from '../controller/UpdateModule.DTO'
import { GetPaginationOptions } from '../../../constant/Result.types'
import { ModuleInfo } from '../types/FrontEndModules.types'

export interface ModuleRepoMethods {
    addModules(module: ModuleDTO): Promise<ResultSetHeader>
    updateModules(updateModule: UpdateModuleDTO): Promise<ResultSetHeader>
    getAllModules(
        options: GetPaginationOptions
    ): Promise<{ module: ModuleInfo[]; total?: number }>
}
