import { Result, Status } from '../../constant/Result.types'

export type GradeInfo = {
    grade: string
    minRange: string
    maxRange: string
    createdBy: string
}

export enum GradeStatus {
    INVALID_RANGE = 'Max range must be greater than or equal to min range',
    RANGE_ALREADY_EXIST = 'RANGE_ALREADY_EXIST',
}

export interface GradeResult extends Result<Status | GradeStatus> {
    grade?: GradeInfo[]
    total?: number
}
