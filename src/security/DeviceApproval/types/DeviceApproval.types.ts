import { Status } from '../entity/DeviceApproval'

export interface DeviceApprovalInfo {
    approvalId: number
    status: Status
}

export enum DeviceApprovalStatus {
    USER_NOT_FOUND = 'user_not_found',
    WRONG_PASSWORD = 'wrong_password',
    SUCCESS = 'Device approved successfully',
    ERROR = 'error',
    INVALID_CREDENTIALS = 'invalid_credentails',
    INVALID_PASSWORD = 'invalid_password',
    OTP_REQUIRED = 'OTP_REQUIRED',
    UNAUTHORIZED_DEVICE = 'UNAUTHORIZED_DEVICE',
}

export type DeviceApprovalResult =
    | { status: DeviceApprovalStatus.USER_NOT_FOUND }
    | { status: DeviceApprovalStatus.WRONG_PASSWORD }
    | {
          status: DeviceApprovalStatus.SUCCESS
          DeviceApproval: DeviceApprovalInfo
      }
    | { status: DeviceApprovalStatus.ERROR; message: string }
    | { status: DeviceApprovalStatus.INVALID_CREDENTIALS }
    | { status: DeviceApprovalStatus.INVALID_PASSWORD }
    | { status: DeviceApprovalStatus.UNAUTHORIZED_DEVICE }
