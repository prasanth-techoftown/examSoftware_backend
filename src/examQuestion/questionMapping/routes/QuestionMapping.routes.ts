import express from 'express'
import { container } from 'tsyringe'
import { QuestionMappingController } from '../controller/QuestionMapping.controller'
import { authenticate } from '../../../middleware/Auth.middleware'
import { authorizeRoles } from '../../../jwtService/Authorize.roles'
import { ROLE } from '../../../constant/enum/Role.enum'

const router = express.Router()
const courseController = container.resolve(QuestionMappingController)

router.post(
    '/addQuestionMapping',
    authenticate,
    authorizeRoles(ROLE.SUPERADMIN),
    (req, res) => courseController.addQuestionMapping(req, res)
)
router.get(
    '/getQuestionMapping',
    authenticate,
    authorizeRoles(ROLE.SUPERADMIN),
    (req, res) => courseController.getQuestionMapping(req, res)
)

router.get(
    '/getExistingCrmCourse',
    authenticate,
    authorizeRoles(ROLE.SUPERADMIN),
    (req, res) => courseController.getExistingCrmCourse(req, res)
)
router.patch(
    '/updateQuestionMapping',
    authenticate,
    authorizeRoles(ROLE.SUPERADMIN),
    (req, res) => courseController.updateQuestionMapping(req, res)
)

// router.patch(
//     '/deleteQuestionMapping',
//     authenticate,
//     authorizeRoles(ROLE.SUPERADMIN),
//     (req, res) => deleteController.deleteRecord(req, res, TABLES.COURSE)
// )

export default router
