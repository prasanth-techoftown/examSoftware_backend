import express from 'express'
import { container } from 'tsyringe'
import { LoginController } from '../controller/login.controller'
import { UserController } from '../../../user/controller/User.controller'

import { authenticate } from '../../../middleware/Auth.middleware'
import { LoginRateLimiter } from '../../../middleware/loginRateLimiter'
import { ROLE } from '../../../constant/enum/Role.enum'
import { authorizeRoles } from '../../../jwtService/Authorize.roles'

const router = express.Router()
const loginController = container.resolve(LoginController)
const userController = container.resolve(UserController)
router.get(
    '/getUserById',
    authenticate,
    authorizeRoles(ROLE.SUPERADMIN, ROLE.STUDENT, ROLE.SUBADMIN, ROLE.DESIGNER),
    (req, res) => userController.getUserById(req, res)
)
router.post('/login', LoginRateLimiter, (req, res) =>
    loginController.loginController(req, res)
)

router.patch(
    '/updatePassword',
    authenticate,

    authorizeRoles(ROLE.SUPERADMIN, ROLE.DESIGNER),
    (req, res) => userController.updatePassword(req, res)
)

export default router
