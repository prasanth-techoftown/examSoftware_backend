import express from 'express'
import { container } from 'tsyringe'
import { ModuleController } from '../controller/Modules.controller'
import { authenticate } from '../../../middleware/Auth.middleware'
import { authorizeRoles } from '../../../jwtService/Authorize.roles'
import { ROLE } from '../../../constant/enum/Role.enum'

const router = express.Router()
const moduleController = container.resolve(ModuleController)

router.post(
    '/addModule',
    authenticate,
    authorizeRoles(ROLE.SUPERADMIN),
    (req, res) => moduleController.addModule(req, res)
)
router.patch(
    '/updateModule',
    authenticate,
    authorizeRoles(ROLE.SUPERADMIN),
    (req, res) => moduleController.updateModule(req, res)
)
router.get(
    '/getModule',
    authenticate,
    authorizeRoles(ROLE.SUPERADMIN),
    (req, res) => moduleController.getModules(req, res)
)

export default router
