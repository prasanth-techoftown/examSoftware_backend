import express from 'express'
import { container } from 'tsyringe'

import { authorizeRoles } from '../../../../jwtService/Authorize.roles'
import { ROLE } from '../../../../constant/enum/Role.enum'
import { authenticate } from '../../../../middleware/Auth.middleware'
import { ExamSessionController } from '../controller/ExamSession.controller'

const router = express.Router()
const examSessionController = container.resolve(ExamSessionController)

router.post(
    '/addExamSession',
    authenticate,
    authorizeRoles(ROLE.STUDENT),
    (req, res) => examSessionController.startExamForStudent(req, res)
)
router.get(
    '/getStudentByExamStatus',
    authenticate,
    authorizeRoles(ROLE.SUPERADMIN),
    (req, res) => examSessionController.getStudentByExamStatus(req, res)
)
// router.patch(
//     '/submit',
//     authenticate,
//     authorizeRoles(ROLE.STUDENT),
//     (req, res) => examSessionController.submitExamSession(req, res)
// )

router.patch(
    '/submit',
    authenticate,
    authorizeRoles(ROLE.STUDENT),
    (req, res) => examSessionController.submitExamSession(req, res)
)

router.get(
    '/getScore',
    authenticate,
    authorizeRoles(ROLE.STUDENT),
    (req, res) => examSessionController.getScore(req, res)
)
router.get(
    '/eligibility/:studentId',
    authenticate,
    authorizeRoles(ROLE.STUDENT),
    (req, res) => examSessionController.checkStudentEligibility(req, res)
)
router.post(
    '/:sessionId/allow-reattempt',
    authenticate,
    authorizeRoles('SUPERADMIN'),
    (req, res) => examSessionController.allowReAttempt(req, res)
)
router.patch(
    '/:sessionId/reset',
    authenticate,
    authorizeRoles('SUPERADMIN'),
    (req, res) => examSessionController.allowResetSession(req, res)
)
router.get(
    '/suspended',
    authenticate,
    authorizeRoles(ROLE.SUPERADMIN),
    (req, res) => examSessionController.getSuspendedStudents(req, res)
)
export default router
