import { Result, Status } from '../../../constant/Result.types'

export type CourseInfo = {
    id?: number
    courseCode: string
    name: string
    durationInHrs: string
    durationInMonths: string
    createdBy: string
}

export enum CourseStatus {
    COURSECODE_ALREADY_EXIST = 'CourseCode_already_exist',
}

export interface CourseResult extends Result<Status | CourseStatus> {
    course?: CourseInfo[]
    total?: number
    courseId?: number
}
