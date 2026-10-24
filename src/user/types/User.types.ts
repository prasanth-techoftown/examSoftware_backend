import { Result, Status } from '../../constant/Result.types'

export type UserInfo = {
    id: string
    firstName: string
    lastName?: string
    userName: string
    email: string
    createdBy?: string
    password?: string
    roleId: number
    phoneNumber?: string
}

export enum UserStatus {
    USER_ALREADY_EXIST = 'Email_already_exist',
    USERNAME_ALREADY_EXIST = 'UserName_already_exist',
    INVALID_USER = 'Invalid_User',
    USER_NOT_FOUND = 'User_not_found',
    DUPLICATE = 'Old Password and New Password is same',
    WRONG_PASSWORD = 'Old password is incorrect',
}

export interface UserRegistrationResult extends Result<Status | UserStatus> {
    user?: UserInfo
}
