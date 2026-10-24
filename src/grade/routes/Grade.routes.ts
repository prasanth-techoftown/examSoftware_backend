import express from 'express'
import { container } from 'tsyringe'
import { authenticate } from '../../middleware/Auth.middleware'
import { authorizeRoles } from '../../jwtService/Authorize.roles'
import { ROLE } from '../../constant/enum/Role.enum'
import { GradeController } from '../controller/Grade.controller'

const router = express.Router()
const gradeController = container.resolve(GradeController)

router.post(
    '/addGrade',
    authenticate,
    authorizeRoles(ROLE.SUPERADMIN),
    (req, res) => gradeController.addGrade(req, res)
)
router.patch(
    '/updateGrade',
    authenticate,
    authorizeRoles(ROLE.SUPERADMIN),
    (req, res) => gradeController.updateGrade(req, res)
)
router.get(
    '/getGrade',
    authenticate,
    authorizeRoles(ROLE.SUPERADMIN),
    (req, res) => gradeController.getGrades(req, res)
)

export default router
