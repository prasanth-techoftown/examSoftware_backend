import { Request, Response } from 'express'

export interface DeviceApprovalMethods {
    approveDevice(req: Request, res: Response): void
    getAllDevices(req: Request, res: Response): void
}
