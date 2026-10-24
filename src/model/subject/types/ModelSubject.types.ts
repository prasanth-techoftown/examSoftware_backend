import { Result, Status } from '../../../constant/Result.types'

export type CourseInfo = {
    id?: number
    name: string
    createdBy: string
}

export interface CourseResult extends Result<Status> {
    course?: CourseInfo[]
    total?: number
    courseId?: number
}
