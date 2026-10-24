import express from 'express'
import { container } from 'tsyringe'
import { AdminController } from '../controller/Admin.controller'
import { authenticate } from '../../middleware/Auth.middleware'
import { authorizeRoles } from '../../jwtService/Authorize.roles'
import { ROLE } from '../../constant/enum/Role.enum'

const router = express.Router()
const adminController = container.resolve(AdminController)

router.post(
    '/addAdmin',
    authenticate,
    authorizeRoles(ROLE.SUPERADMIN),
    (req, res) => adminController.addAdmin(req, res)
)
router.post('/addSuperAdmin', (req, res) => adminController.addAdmin(req, res))
router.get(
    '/getAdmin',
    authenticate,
    authorizeRoles(ROLE.SUPERADMIN),
    (req, res) => adminController.getAdmin(req, res)
)
router.patch(
    '/updateAdmin',
    authenticate,
    authorizeRoles(ROLE.SUPERADMIN),
    (req, res) => adminController.updateAdmin(req, res)
)
router.patch(
    '/deleteAdmin',
    authenticate,
    authorizeRoles(ROLE.SUPERADMIN),
    (req, res) => adminController.deleteAdmin(req, res)
)
export default router
