import express from 'express'
import { container } from 'tsyringe'
import { CertificateController } from '../controller/Certificate.controller'
import { authorizeRoles } from '../../../jwtService/Authorize.roles'
import { ROLE } from '../../../constant/enum/Role.enum'
import { authenticate } from '../../../middleware/Auth.middleware'

const router = express.Router()
const certificateController = container.resolve(CertificateController)

router.get(
    '/getCertificateList',
    authenticate,
    authorizeRoles(ROLE.SUPERADMIN, ROLE.DESIGNER),
    (req, res) => certificateController.getAllStudent(req, res)
)

export default router
