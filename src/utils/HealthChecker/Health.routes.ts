import express from 'express'
import { container } from 'tsyringe'
import {
    HealthController,
    HealthControllerMethods,
} from './HealthCheckerContoller'

const router = express.Router()

const healthController: HealthControllerMethods =
    container.resolve(HealthController)

router.get('/', healthController.getHealth)

export default router
