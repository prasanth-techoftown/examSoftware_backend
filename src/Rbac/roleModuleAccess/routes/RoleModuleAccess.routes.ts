import express from 'express'
import { container } from 'tsyringe'
import { RoleModuleAccessController } from '../controller/RoleModuleAccess.controller'
import { authenticate } from '../../../middleware/Auth.middleware'
import { ROLE } from '../../../constant/enum/Role.enum'
import { authorizeRoles } from '../../../jwtService/Authorize.roles'

const router = express.Router()
const roleModuleAccessController = container.resolve(RoleModuleAccessController)

router.post(
    '/addRoleModuleAccess',
    authenticate,
    authorizeRoles(ROLE.SUPERADMIN),
    (req, res) => roleModuleAccessController.addRoleModuleAccess(req, res)
)
router.patch(
    '/updateRoleModuleAccess',
    authenticate,
    authorizeRoles(ROLE.SUPERADMIN),
    (req, res) => roleModuleAccessController.updateRoleModuleAccess(req, res)
)
router.get(
    '/getRoleModuleAccess',
    authenticate,
    authorizeRoles(ROLE.SUPERADMIN),
    (req, res) => roleModuleAccessController.getRoleModuleAccess(req, res)
)

export default router
