import express from 'express'
import { container } from 'tsyringe'
import { StudentLoginController } from '../controller/StudentLogin.controller'

const router = express.Router()
const studentLoginController = container.resolve(StudentLoginController)

router.post('/studentLogin', (req, res) =>
    studentLoginController.studentLoginController(req, res)
)

export default router
