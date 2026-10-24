import { Result, Status } from '../../constant/Result.types'

export type AdmissionDataInfo = {
    branchId?: number
    admissionNumber: string
    dateOfAdmission: string
    firstName: string
    lastName: string
    dateOfBirth: Date
    gender: string
    address1: string
    address2: string
    state: string
    city: string
    pincode: number
    phoneNumber: string
    whatsappNumber: number
    parentOrGuardianName: string
    parentOrGuardianNumber: string
    qualification: string
    courseId: number
    fees: number
    courseName: string
    branchName: string
    counselledBy: string
    notes: string
    academicYear: number
}

export interface AdmissionDataResult extends Result<Status> {
    data?: AdmissionDataInfo[]
}
