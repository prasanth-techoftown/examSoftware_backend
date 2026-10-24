import { Status } from '../entity/DeviceApproval'

export interface DeviceApprovalServiceMethods {
    approveDevice(approvalId: number, status: Status): Promise<void>
    listAllDevices(): void
}
