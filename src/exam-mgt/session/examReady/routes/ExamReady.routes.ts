import express from 'express'
import { container } from 'tsyringe'
import { authenticate } from '../../../../middleware/Auth.middleware'
import { ROLE } from '../../../../constant/enum/Role.enum'
import { authorizeRoles } from '../../../../jwtService/Authorize.roles'
import { ExamReadyController } from '../controller/ExamReady.controller'

const router = express.Router()
const examRequestController = container.resolve(ExamReadyController)

router.get(
    '/getExamReadyDetailById',
    authenticate,
    authorizeRoles(ROLE.STUDENT),
    (req, res) => examRequestController.getExamReadyDetails(req, res)
)

export default router
