import { Result, Status } from '../../../constant/Result.types'

export type StudentInfo = {
    id?: number
    admissionNumber: string
    firstName: string
    lastName: string
    grade: string
    courseName: string
    percentage: string
    score: string
    branchId: string
    branchName: string
}
export type BranchStudent = {
    id: number
    branchId: number
    admissionId: number
    completionDate: Date | null
    certificateId: string | null
    issuedDate: Date | null
    firstName: string
    lastName: string
    grade: string | null
    course: string | null
    admissionNumber: string
    duration: number | null
}
export interface StudentResult extends Result<Status> {
    student?: StudentInfo[]
    students?: BranchStudent[]
    total?: number
}
