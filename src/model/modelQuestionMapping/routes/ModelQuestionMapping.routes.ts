import express from 'express'
import { container } from 'tsyringe'
import { authenticate } from '../../../middleware/Auth.middleware'
import { authorizeRoles } from '../../../jwtService/Authorize.roles'
import { ROLE } from '../../../constant/enum/Role.enum'
import { ModelQuestionMappingController } from '../controller/ModelQuestionMapping.controller'

const router = express.Router()
const modelQuestionMappingController = container.resolve(
    ModelQuestionMappingController
)

router.post(
    '/addModelQuestionMapping',
    authenticate,
    authorizeRoles(ROLE.SUPERADMIN),
    (req, res) =>
        modelQuestionMappingController.addModelQuestionMapping(req, res)
)
router.get(
    '/getModelQuestionMapping',
    // authenticate,
    // authorizeRoles(ROLE.SUPERADMIN),
    (req, res) =>
        modelQuestionMappingController.getModelQuestionMapping(req, res)
)
router.patch(
    '/updateModelQuestionMapping',
    authenticate,
    authorizeRoles(ROLE.SUPERADMIN),
    (req, res) =>
        modelQuestionMappingController.updateModelQuestionMapping(req, res)
)

export default router
