import express from 'express'
import { container } from 'tsyringe'
import { QuestionController } from '../controller/Question.controller'
import { authorizeRoles } from '../../../jwtService/Authorize.roles'
import { authenticate } from '../../../middleware/Auth.middleware'
import { ROLE } from '../../../constant/enum/Role.enum'

const router = express.Router()
const questionController = container.resolve(QuestionController)

router.post(
    '/addQuestion',
    authenticate,
    authorizeRoles(ROLE.SUPERADMIN),
    (req, res) => questionController.addQuestion(req, res)
)
router.get(
    '/getAllQuestion',
    authenticate,
    authorizeRoles(ROLE.SUPERADMIN),
    (req, res) => questionController.getAllQuestion(req, res)
)
router.patch(
    '/updateQuestion',
    authenticate,
    authorizeRoles(ROLE.SUPERADMIN),
    (req, res) => questionController.updateQuestion(req, res)
)

router.patch(
    '/deleteQuestion',
    authenticate,
    authorizeRoles(ROLE.SUPERADMIN),
    (req, res) => questionController.deleteQuestion(req, res)
)

export default router
