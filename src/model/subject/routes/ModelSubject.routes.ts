import express from 'express'
import { container } from 'tsyringe'
import { ModelSubjectController } from '../controller/ModelSubject.controller'
import { authenticate } from '../../../middleware/Auth.middleware'
import { authorizeRoles } from '../../../jwtService/Authorize.roles'
import { ROLE } from '../../../constant/enum/Role.enum'

const router = express.Router()
const courseController = container.resolve(ModelSubjectController)

router.post(
    '/addModelSubject',
    authenticate,
    authorizeRoles(ROLE.SUPERADMIN),
    (req, res) => courseController.addCourse(req, res)
)
router.get(
    '/getModelSubject',
    authenticate,
    authorizeRoles(ROLE.SUPERADMIN),
    (req, res) => courseController.getAllCourse(req, res)
)
router.patch(
    '/updateModelSubject',
    authenticate,
    authorizeRoles(ROLE.SUPERADMIN),
    (req, res) => courseController.updateCourse(req, res)
)

export default router
