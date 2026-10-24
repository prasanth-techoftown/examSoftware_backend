import { Result, Status } from "../../constant/Result.types"

export type CourseInfo = {
    id: number
    courseCode: string
    courseName: string
    description: string | null
    durationInMonths: number
    durationInHrs: number
    courseCategoryId: number
    courseCategory: string | null
    isActive: number
}

export type CourseQueryOptions = {
    limit?: number
    offset?: number
    all?: boolean
    search?: string
    courseCategoryId?: number
}

export enum CourseStatus {
    CATEGORY_NOT_EXIST = 'CATEGORY_NOT_EXIST',
    CODE_ALREADY_EXIST = 'CODE_ALREADY_EXIST',
}

export interface CourseResult extends Result<Status | CourseStatus> {
    Course?: CourseInfo[]
    total?: number
}
