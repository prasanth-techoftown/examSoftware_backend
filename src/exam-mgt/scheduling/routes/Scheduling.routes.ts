import express from 'express'
import { container } from 'tsyringe'
import { authenticate } from '../../../middleware/Auth.middleware'
import { authorizeRoles } from '../../../jwtService/Authorize.roles'
import { ROLE } from '../../../constant/enum/Role.enum'
import { SchedulingController } from '../controller/Scheduling.controller'

const router = express.Router()
const schedulingController = container.resolve(SchedulingController)

router.post(
    '/addScheduling',
    authenticate,
    authorizeRoles(ROLE.SUPERADMIN),
    (req, res) => schedulingController.addScheduling(req, res)
)
router.get(
    '/getScheduling',
    authenticate,
    authorizeRoles(ROLE.SUPERADMIN),
    (req, res) => schedulingController.getAllScheduling(req, res)
)

export default router
