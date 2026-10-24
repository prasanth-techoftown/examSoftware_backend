import express from 'express'
import { container } from 'tsyringe'
import { QuestionCourseController } from '../controller/QuestionCourse.controller'
import { authenticate } from '../../../middleware/Auth.middleware'
import { authorizeRoles } from '../../../jwtService/Authorize.roles'
import { ROLE } from '../../../constant/enum/Role.enum'

const router = express.Router()
const courseController = container.resolve(QuestionCourseController)

router.post(
    '/addCourseForQuestion',
    authenticate,
    authorizeRoles(ROLE.SUPERADMIN),
    (req, res) => courseController.addCourse(req, res)
)
router.get(
    '/getCourseForQuestion',
    authenticate,
    authorizeRoles(ROLE.SUPERADMIN),
    (req, res) => courseController.getAllCourse(req, res)
)
router.patch(
    '/updateCourseForQuestion',
    authenticate,
    authorizeRoles(ROLE.SUPERADMIN),
    (req, res) => courseController.updateCourse(req, res)
)

// router.patch(
//     '/deleteQuestionCourse',
//     authenticate,
//     authorizeRoles(ROLE.SUPERADMIN),
//     (req, res) => deleteController.deleteRecord(req, res, TABLES.COURSE)
// )

export default router
