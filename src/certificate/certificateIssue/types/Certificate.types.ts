import { Result, Status } from '../../../constant/Result.types'

export type CertificateInfo = {
    id: number
    admissionNumber: string
    firstName: string
    lastName: string
    courseName: string
    certificateId: string
    durationInMonths: number
    grade: string
    completionDate: string
    issuedDate: string
}

export enum CertificateStatus {
    NOT_YET_SENT = 'NOT_YET_SENT',
    DESIGNER = 'DESIGNER',
    PRINTED = 'PRINTED',
    DISPATCHED = 'DISPATCHED',
    RECEIVED = 'RECEIVED',

    ISSUED = 'ISSUED',
}

export type SqlParam = string | number | null

export interface CertificateResult extends Result<Status> {
    data?: CertificateInfo[]
    total?: number
    message?: string
}
