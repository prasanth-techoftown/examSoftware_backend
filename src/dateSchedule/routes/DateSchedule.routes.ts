import express from 'express'
import { container } from 'tsyringe'
import { DateScheduleController } from '../controller/DateSchedule.controller'
import { ROLE } from '../../constant/enum/Role.enum'
import { authorizeRoles } from '../../jwtService/Authorize.roles'
import { authenticate } from '../../middleware/Auth.middleware'

const router = express.Router()
const dateScheduleController = container.resolve(DateScheduleController)

router.post(
    '/addDateSchedule',
    authenticate,
    authorizeRoles(ROLE.SUPERADMIN),
    (req, res) => dateScheduleController.addDateSchedule(req, res)
)
router.get(
    '/getDateSchedule',
    // authenticate,
    // authorizeRoles(ROLE.SUPERADMIN),
    (req, res) => dateScheduleController.getAllDateSchedule(req, res)
)

export default router
