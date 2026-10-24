import express from 'express'
import { container } from 'tsyringe'

import { CourseController } from '../controller/Course.controller'
import { ROLE } from '../../constant/enum/Role.enum'
import { authorizeRoles } from '../../jwtService/Authorize.roles'
import { authenticate } from '../../middleware/Auth.middleware'

const router = express.Router()
const controller = container.resolve(CourseController)

router.post(
    '/addCourse',
    authenticate,
    authorizeRoles(ROLE.SUPERADMIN),
    (req, res) => controller.addCourse(req, res)
)
router.patch(
    '/updateCourse',
    authenticate,
    authorizeRoles(ROLE.SUPERADMIN),
    (req, res) => controller.updateCourse(req, res)
)
router.get(
    '/getCourse',
    authenticate,
    authorizeRoles(ROLE.SUPERADMIN),
    (req, res) => controller.getCourse(req, res)
)
router.patch(
    '/deleteCourse',
    authenticate,
    authorizeRoles(ROLE.SUPERADMIN),
    (req, res) => controller.deleteCourse(req, res)
)

export default router
