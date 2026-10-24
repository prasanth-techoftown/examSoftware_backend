import { Result, Status } from '../../constant/Result.types'

export type AdminInfo = {
    id: number
    firstName: string
    lastName: string
    userName: string
    email: string
    phoneNumber: string
    userId: string
    roleId: number
    createdBy?: string
}
export enum AdminStatus {
    EMAIL_ALREADY_EXIST = 'Email_already_exist',
    PHONENUMBER_EXIST = 'Phone_number_exist',
    USERNAME_ALREADY_EXIST = 'UserName_already_exist',
    INVALID_ROLE = 'Invalid_Role',
}

export interface AdminResult extends Result<Status | AdminStatus> {
    admin?: AdminInfo[]
}
