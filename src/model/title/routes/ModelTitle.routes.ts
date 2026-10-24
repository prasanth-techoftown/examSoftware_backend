import express from 'express'
import { container } from 'tsyringe'
import { ModelTitleController } from '../controller/ModelTitle.controller'
import { authenticate } from '../../../middleware/Auth.middleware'
import { authorizeRoles } from '../../../jwtService/Authorize.roles'
import { ROLE } from '../../../constant/enum/Role.enum'

const router = express.Router()
const courseController = container.resolve(ModelTitleController)

router.post(
    '/addTitle',
    authenticate,
    authorizeRoles(ROLE.SUPERADMIN),
    (req, res) => courseController.addCourse(req, res)
)
router.get(
    '/getTitle',
    authenticate,
    authorizeRoles(ROLE.SUPERADMIN),
    (req, res) => courseController.getAllCourse(req, res)
)
router.patch(
    '/updateTitle',
    authenticate,
    authorizeRoles(ROLE.SUPERADMIN),
    (req, res) => courseController.updateCourse(req, res)
)

export default router
