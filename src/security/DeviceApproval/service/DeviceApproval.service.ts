import { inject, injectable } from 'tsyringe'
import { DeviceApprovalRepository } from '../repository/DeviceApproval.repo'
// import { User } from '../../../user/entity/User'
import { AppError } from '../../../constant/App.error'
import { DeviceApprovalServiceMethods } from './DeviceApproval.serviceInterface'
import { Status } from '../entity/DeviceApproval'

@injectable()
export class DeviceApprovalService implements DeviceApprovalServiceMethods {
    // private userRepository

    constructor(
        @inject('DeviceApprovalRepository')
        private deviceApprovalRepo: DeviceApprovalRepository
    ) {
        // this.userRepository = AppDataSource.getRepository(User)
    }

    approveDevice = async (
        approvalId: number,
        status: Status
    ): Promise<void> => {
        const approval = await this.deviceApprovalRepo.findById(approvalId)

        if (!approval) {
            throw new AppError('Approval request not found', 404)
        }
        await this.deviceApprovalRepo.approveDevice(approvalId, status)
    }

    listAllDevices = async () => {
        return this.deviceApprovalRepo.getAllDevices()
    }
}
