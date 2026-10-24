import express from 'express'
import { container } from 'tsyringe'
import { authenticate } from '../../../middleware/Auth.middleware'
import { authorizeRoles } from '../../../jwtService/Authorize.roles'
import { ROLE } from '../../../constant/enum/Role.enum'
import { RoleController } from '../controller/Role.controller'

const router = express.Router()
const roleController = container.resolve(RoleController)

router.post(
    '/addRole',
    authenticate,
    authorizeRoles(ROLE.SUPERADMIN),
    (req, res) => roleController.addRole(req, res)
)
router.get(
    '/getRole',
    authenticate,
    authorizeRoles(ROLE.SUPERADMIN),
    (req, res) => roleController.getRole(req, res)
)
router.patch(
    '/updateRole',
    authenticate,
    authorizeRoles(ROLE.SUPERADMIN),
    (req, res) => roleController.updateRole(req, res)
)
// router.patch(
//     '/deleteRole',
//     authenticate,
//     authorizeRoles(ROLE.SUPERADMIN),
//     (req, res) => deleteController.deleteRecord(req, res, TABLES.ROLE)
// )
export default router
