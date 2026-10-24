import express from 'express'
import { container } from 'tsyringe'
import { authorizeRoles } from '../../../jwtService/Authorize.roles'
import { authenticate } from '../../../middleware/Auth.middleware'
import { ROLE } from '../../../constant/enum/Role.enum'
import { StudentControllerForDesigner } from '../controller/Student.Controller'

const router = express.Router()
const studentController = container.resolve(StudentControllerForDesigner)

router.get(
    '/getStudent',
    authenticate,
    authorizeRoles(ROLE.DESIGNER),
    (req, res) => studentController.getStudentForDesigner(req, res)
)

router.get(
    '/branch/:branchId/students',
    authenticate,
    authorizeRoles(ROLE.DESIGNER),
    (req, res) => studentController.getStudentsForBranch(req, res)
)

export default router
