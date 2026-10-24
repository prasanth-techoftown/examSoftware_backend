import { inject, injectable } from 'tsyringe'
import { RoleModuleAccessServiceMethods } from '../service/RoleModuleAccess.serviceInterface'
import { Request, Response } from 'express'

import { UpdateRoleModuleDTO } from './UpdateModuleAccess.DTO'
import { sendError, sendSuccess } from '../../../utils/Response'
import { ERORR_MESSAGES } from '../../../constant/Error.message'
import { DataSanitize } from '../../../utils/DataSanitize'
import { RoleModuleDTO } from './RoleModuleAccess.DTO'
import { SUCCESS_MESSAGES } from '../../../constant/Success.message'
import { Status } from '../../../constant/Result.types'

@injectable()
export class RoleModuleAccessController {
    constructor(
        @inject('RoleModuleAccessService')
        private RoleModuleAccessService: RoleModuleAccessServiceMethods
    ) {}

    addRoleModuleAccess = async (req: Request, res: Response) => {
        try {
            let { roleId, permissions, createdBy } = req.body

            const missingFields = ['roleId', 'permissions', 'createdBy'].filter(
                (field) => !req.body[field]
            )

            if (missingFields.length > 0) {
                return sendError(
                    res,
                    `${ERORR_MESSAGES.MISSING_FIELD}: ${missingFields.join(', ')}`,
                    400
                )
            }
            try {
                ;({ roleId, permissions, createdBy } = DataSanitize({
                    roleId,
                    permissions,
                    createdBy,
                }))
            } catch (sanitizeError: unknown) {
                console.log(sanitizeError, 'sanitizeError')

                sendError(res, ERORR_MESSAGES.INVALID_INPUT, 400)

                return
            }

            const roleModuleDTO = new RoleModuleDTO(
                roleId,
                permissions,
                createdBy
            )

            const result =
                await this.RoleModuleAccessService.addRoleModuleAccess(
                    roleModuleDTO
                )
            if (result.status === Status.NAME_ALREADY_EXIST) {
                return sendError(
                    res,
                    'Access are already assigned for this Role and Module',
                    400
                )
            }
            return sendSuccess(res, SUCCESS_MESSAGES.CREATED, result, 201)
        } catch (error) {
            return sendError(res, ERORR_MESSAGES.SERVER, 500, error)
        }
    }

    updateRoleModuleAccess = async (req: Request, res: Response) => {
        try {
            let { id, roleId, permissions, updatedBy } = req.body
            const missingFields = [
                'id',
                'roleId',
                'permissions',
                'updatedBy',
            ].filter((field) => !req.body[field])

            if (missingFields.length > 0) {
                return sendError(
                    res,
                    `${ERORR_MESSAGES.MISSING_FIELD}: ${missingFields.join(', ')}`,
                    400
                )
            }

            try {
                ;({ id, roleId, permissions, updatedBy } = DataSanitize({
                    id,
                    roleId,
                    permissions,
                    updatedBy,
                }))
            } catch (sanitizeError: unknown) {
                console.log(sanitizeError, 'sanitizeError')

                sendError(res, ERORR_MESSAGES.INVALID_INPUT, 400)
                return
            }

            const roleModuleDTO = new UpdateRoleModuleDTO(
                id,
                roleId,
                permissions,
                updatedBy
            )

            const result =
                await this.RoleModuleAccessService.updateRoleModuleAccess(
                    roleModuleDTO
                )
            if (result.status === Status.NO_NAME_FOUND) {
                return sendError(res, 'Role Module not Found', 400)
            }
            return sendSuccess(res, SUCCESS_MESSAGES.UPDATED, result)
        } catch (error) {
            return sendError(res, ERORR_MESSAGES.SERVER, 500, error)
        }
    }

    getRoleModuleAccess = async (req: Request, res: Response) => {
        try {
            const roleModuleAccess =
                await this.RoleModuleAccessService.getRoleModuleAccess()
            return sendSuccess(res, SUCCESS_MESSAGES.FETCHED, roleModuleAccess)
        } catch (error) {
            return sendError(res, ERORR_MESSAGES.SERVER, 500, error)
        }
    }
}
