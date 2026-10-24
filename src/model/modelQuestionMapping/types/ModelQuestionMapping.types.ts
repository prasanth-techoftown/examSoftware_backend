import { Result, Status } from '../../../constant/Result.types'

export type SubjectInput = {
    modelSubjectId: number
    subjectTotalQuestion: number
}

export type GroupedCourse = {
    id: number
    titleId: number
    modelTitleName: string
    courseTotalQuestion: number
    time: number
    course: {
        modelSubjectId: number
        questionCourseName?: string
        subjectTotalQuestion: number
        subjectName?: string
    }[]
}
export interface ModelQuestionMappingResult extends Result<Status> {
    ModelQuestionMapping?: GroupedCourse[]
    total?: number
}
