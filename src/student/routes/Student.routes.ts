import express from 'express'
import { container } from 'tsyringe'
import { StudentController } from '../controller/Student.controller'
import { uploadImage } from '../../middleware/multer/upload.middleware'
import { ROLE } from '../../constant/enum/Role.enum'
import { authorizeRoles } from '../../jwtService/Authorize.roles'
import { authenticate } from '../../middleware/Auth.middleware'

const router = express.Router()
const studentController = container.resolve(StudentController)
// const deleteController: DeleteMethods = container.resolve(DeleteController)

router.post(
    '/addStudent',
    // autheticate,
    // authorizeRolnes(ROLE.SUPERADMIN),
    uploadImage('admission'),
    (req, res) => studentController.addStudent(req, res)
)
router.get(
    '/getStudent',
    authenticate,
    authorizeRoles(ROLE.SUPERADMIN),
    (req, res) => studentController.getAllStudent(req, res)
)
router.patch(
    '/updateStudent',
    authenticate,
    authorizeRoles(ROLE.SUPERADMIN),
    uploadImage('admission'),
    (req, res) => studentController.updateStudent(req, res)
)

// router.patch(
//     '/deleteStudent',
//     authenticate,
//     authorizeRoles(ROLE.SUPERADMIN),
//     (req, res) => deleteController.deleteRecord(req, res, TABLES.COURSE)
// )

export default router
