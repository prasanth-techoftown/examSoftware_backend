import express from 'express'
import { container } from 'tsyringe'
import { authenticate } from '../../middleware/Auth.middleware'
import { authorizeRoles } from '../../jwtService/Authorize.roles'
import { ROLE } from '../../constant/enum/Role.enum'
import { AdmissionDataController } from '../controller/AdmissionData.controller'

const router = express.Router()
const admissionDataController = container.resolve(AdmissionDataController)

router.get(
    '/getAdmissionData',
    authenticate,
    authorizeRoles(ROLE.SUPERADMIN),
    (req, res, next) => admissionDataController.getAdmissionData(req, res, next)
)

export default router
