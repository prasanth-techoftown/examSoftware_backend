import { Result, Status } from '../../constant/Result.types'

export type StudentInfo = {
    id?: number
    admissionNumber: string
    firstName: string
    lastName: string
    phoneNumber: string
    whatsappNumber: string
    gender: string
    address: string

    city: string
    state: string
    pincode: number
    parentOrGuardianName: string
    parentOrGuardianNumber: string
    counselledBy: string
    courseId: number
    dateOfBirth: string
    qualification: string
    totalFees: number
    notes: string
    academicYear: number
    dateOfAdmission: string
    branchId: string
    branchName: string
    email: string
    createdBy: string
    photoName?: string
}
export interface InsertResult {
    insertId: number
}
export interface StudentResult extends Result<Status> {
    student?: StudentInfo[]
    total?: number
}
export type CourseStat = {
    courseId: number
    questionCount: number
    mappingCount: number
}
