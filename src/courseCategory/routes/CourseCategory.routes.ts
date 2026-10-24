import express from 'express'
import { container } from 'tsyringe'

import { CourseCategoryController } from '../controller/CourseCategory.controller'
import { ROLE } from '../../constant/enum/Role.enum'
import { authorizeRoles } from '../../jwtService/Authorize.roles'
import { authenticate } from '../../middleware/Auth.middleware'

const router = express.Router()
const controller = container.resolve(CourseCategoryController)

router.post(
    '/addCourseCategory',
    authenticate,
    authorizeRoles(ROLE.SUPERADMIN),
    (req, res) => controller.addCourseCategory(req, res)
)
router.patch(
    '/updateCourseCategory',
    authenticate,
    authorizeRoles(ROLE.SUPERADMIN),
    (req, res) => controller.updateCourseCategory(req, res)
)
router.get(
    '/getCourseCategory',
    authenticate,
    authorizeRoles(ROLE.SUPERADMIN),
    (req, res) => controller.getCourseCategory(req, res)
)
router.patch(
    '/deleteCourseCategory',
    authenticate,
    authorizeRoles(ROLE.SUPERADMIN),
    (req, res) => controller.deleteCourseCategory(req, res)
)

export default router
