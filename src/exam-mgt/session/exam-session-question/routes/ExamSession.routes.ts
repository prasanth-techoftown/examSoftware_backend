import express from 'express'
import { container } from 'tsyringe'
import { authenticate } from '../../../../middleware/Auth.middleware'
import { ROLE } from '../../../../constant/enum/Role.enum'
import { authorizeRoles } from '../../../../jwtService/Authorize.roles'
import { ExamSessionQuestionController } from '../controller/ExamSessionQuestion.controller'

const router = express.Router()
const examSessionQuestionController = container.resolve(
    ExamSessionQuestionController
)

router.get(
    '/getExamSessionQuestion',
    authenticate,
    authorizeRoles(ROLE.STUDENT),
    (req, res) =>
        examSessionQuestionController.getExamQuestionBySessionId(req, res)
)

export default router
