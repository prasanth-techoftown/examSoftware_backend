import express from 'express'
import { container } from 'tsyringe'

import { authorizeRoles } from '../../../../jwtService/Authorize.roles'
import { ROLE } from '../../../../constant/enum/Role.enum'
import { authenticate } from '../../../../middleware/Auth.middleware'
import { ExamAnswerLogController } from '../controller/ExamAnswerLogs.controller'

const router = express.Router()
const examAnswerLogController = container.resolve(ExamAnswerLogController)

router.post(
    '/addExamAnswerLog',
    authenticate,
    authorizeRoles(ROLE.STUDENT),
    (req, res) => examAnswerLogController.addAnswerLog(req, res)
)
router.get(
    '/:sessionId/answers',
    authenticate,
    authorizeRoles(ROLE.STUDENT),
    (req, res) => examAnswerLogController.getSavedAnswers(req, res)
)

export default router
