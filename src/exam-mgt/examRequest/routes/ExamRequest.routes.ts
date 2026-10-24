import express from 'express'
import { container } from 'tsyringe'
import { ExamRequestController } from '../controller/ExamRequest.controller'
import { authenticate } from '../../../middleware/Auth.middleware'
import { ROLE } from '../../../constant/enum/Role.enum'
import { authorizeRoles } from '../../../jwtService/Authorize.roles'

const router = express.Router()
const examRequestController = container.resolve(ExamRequestController)

router.post(
    '/addExamRequest',
    authenticate,
    authorizeRoles(ROLE.SUPERADMIN),
    (req, res) => examRequestController.addExamRequest(req, res)
)

router.get(
    '/getExamRequest',
    authenticate,
    authorizeRoles(ROLE.SUPERADMIN),
    (req, res) => examRequestController.getExamRequests(req, res)
)

router.get(
    '/getStudentByStatus',
    authenticate,
    authorizeRoles(ROLE.SUPERADMIN),
    (req, res) => examRequestController.getStudentByStatus(req, res)
)

router.get(
    '/branch/:branchId/students',
    authenticate,
    authorizeRoles(ROLE.SUPERADMIN),
    (req, res) =>
        examRequestController.getExamRequestStudentsForBranch(req, res)
)

router.get(
    '/getStudentByStatusForBranch/:branchId/students',
    authenticate,
    authorizeRoles(ROLE.SUPERADMIN),
    (req, res) => examRequestController.getStudentByStatusForBranch(req, res)
)

router.patch(
    '/updateRequestStatus',
    authenticate,
    authorizeRoles(ROLE.SUPERADMIN),
    (req, res) => examRequestController.updateExamRequest(req, res)
)

export default router
