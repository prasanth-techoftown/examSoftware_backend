import { Result, Status } from '../../../constant/Result.types'

export type SubjectInput = {
    questionCourseId: number
    subjectTotalQuestion: number
}

export type GroupedCourse = {
    id: number
    crmCourseId: number
    crmCourseName: string
    courseTotalQuestion: number
    time: number
    course: {
        questionCourseId: number
        questionCourseName: string
        subjectTotalQuestion: number
    }[]
}

export type Course = {
    crmCourseId: number
    course: string
}
export interface QuestionMappingResult extends Result<Status> {
    questionMapping?: GroupedCourse[]
    total?: number
    course?: Course[]
}
export type CourseIdRow = {
    crmCourseId: number
    name: string
}
