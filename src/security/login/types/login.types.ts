export type LoginUserRow = {
    userId: number
    firstName: string
    lastName: string
    userName: string
    email: string
    deviceFingerprint: string | null
    password: string
    role: string | null
    branchId?: number | null
}
export interface LoginInfo {
    name?: string
    userName: string
    role?: string
    branchId: number
    sessionId?: string
    userId: string
}
export enum LoginStatus {
    USER_NOT_FOUND = 'user_not_found',
    WRONG_PASSWORD = 'wrong_password',
    SUCCESS = 'success',
    ERROR = 'error',
    INVALID_CREDENTIALS = 'invalid_credentails',
    INVALID_PASSWORD = 'invalid_password',
    OTP_REQUIRED = 'OTP_REQUIRED',
    UNAUTHORIZED_DEVICE = 'UNAUTHORIZED_DEVICE',
    DEVICE_REJECTED = 'DEVICE_REJECTED',
}

export type LoginResult =
    | { status: LoginStatus.USER_NOT_FOUND }
    | { status: LoginStatus.WRONG_PASSWORD }
    | { status: LoginStatus.SUCCESS; login: LoginInfo }
    | { status: LoginStatus.ERROR; message: string }
    | { status: LoginStatus.INVALID_CREDENTIALS }
    | { status: LoginStatus.INVALID_PASSWORD }
    | { status: LoginStatus.UNAUTHORIZED_DEVICE }
    | { status: LoginStatus.DEVICE_REJECTED }
