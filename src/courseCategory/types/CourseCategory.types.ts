import { Result, Status } from "../../constant/Result.types"

export type CourseCategoryInfo = {
    id: number
    name: string
    firstName?: string | null
}

export enum CourseCategoryStatus {
    IN_USE = 'CATEGORY_IN_USE',
}

export interface CourseCategoryResult
    extends Result<Status | CourseCategoryStatus> {
    courseCategory?: CourseCategoryInfo[]
    total?: number
}
