import express from 'express'
import { container } from 'tsyringe'
import { DeviceApprovalController } from '../controller/DeviceApproval.controller'
import { DeviceApprovalMethods } from '../controller/DeviceApproval.controllerInterface'

// import { ROLE } from '../../../constant/Role.enum'

const router = express.Router()
const controller: DeviceApprovalMethods = container.resolve(
    DeviceApprovalController
)

router.post(
    '/device-approval/:approvalId/approve',
    // authenticate,
    // authorizeRoles(ROLE.SUPERADMIN),
    controller.approveDevice
)
router.get(
    '/devices',
    // authenticate,
    // authorizeRoles(ROLE.SUPERADMIN),
    controller.getAllDevices
)
export default router
