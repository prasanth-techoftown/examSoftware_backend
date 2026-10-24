import { inject, injectable } from 'tsyringe'
import { Request, Response } from 'express'
import { sendError, sendSuccess } from '../../../utils/Response'
import { DeviceApprovalMethods } from './DeviceApproval.controllerInterface'
import { DeviceApprovalServiceMethods } from '../service/DeviceApproval.serviceInterface'
import { DeviceApprovalStatus } from '../types/DeviceApproval.types'

@injectable()
export class DeviceApprovalController implements DeviceApprovalMethods {
    constructor(
        @inject('DeviceApprovalService')
        private deviceApprovalService: DeviceApprovalServiceMethods
    ) {}

    approveDevice = async (req: Request, res: Response) => {
        try {
            const approvalId = Number(req.params.approvalId)
            const { status } = req.body
            await this.deviceApprovalService.approveDevice(approvalId, status)

            return sendSuccess(res, DeviceApprovalStatus.SUCCESS)
        } catch (err) {
            console.log(err, 'device approval controller')

            return sendError(res, 'Approval failed', 500)
        }
    }
    getAllDevices = async (req: Request, res: Response) => {
        try {
            const devices = await this.deviceApprovalService.listAllDevices()
            sendSuccess(res, 'All devices fetched', devices)
        } catch (err) {
            sendError(res, 'Failed to fetch devices', 500, err)
        }
    }
}
