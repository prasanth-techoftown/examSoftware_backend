import { Result, Status } from '../../../constant/Result.types'

export type ModuleInfo = {
    name: string
    createdBy: string
}

export enum FrontEndModuleStatus {}

export interface FrontEndModuleResult extends Result<Status> {
    module?: ModuleInfo[]
    total?: number
}
