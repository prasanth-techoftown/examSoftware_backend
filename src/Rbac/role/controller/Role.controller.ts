import { Request, Response } from 'express'
import { inject, injectable } from 'tsyringe'

import { RoleServiceMethods } from '../service/Role.serviceInterface'
import { DataSanitize } from '../../../utils/DataSanitize'
import { sendError, sendSuccess } from '../../../utils/Response'
import { ERORR_MESSAGES } from '../../../constant/Error.message'
import { RoleStatus } from '../types/Role.types'
import { SUCCESS_MESSAGES } from '../../../constant/Success.message'
import { RoleDTO } from './Role.DTO'
import { Status } from '../../../constant/Result.types'
import { UpdateRoleDTO } from './UpdateRole.DTO'

@injectable()
export class RoleController {
    constructor(
        @inject('RoleService')
        private roleService: RoleServiceMethods
    ) {}

    addRole = async (req: Request, res: Response) => {
        try {
            let { name, createdBy } = req.body

            const missingFields = ['name'].filter((field) => !req.body[field])

            if (missingFields.length > 0) {
                return sendError(
                    res,
                    `${ERORR_MESSAGES.MISSING_FIELD}: ${missingFields.join(', ')}`,
                    400
                )
            }

            try {
                ;({ name, createdBy } = DataSanitize({
                    name,
                    createdBy,
                }))
            } catch (sanitizeError: unknown) {
                console.log(sanitizeError, 'sanitizeError')

                sendError(res, ERORR_MESSAGES.INVALID_INPUT, 400)

                return
            }
            const data = new RoleDTO(name, createdBy)
            const result = await this.roleService.addRole(data)
            switch (result.status) {
                case Status.NAME_ALREADY_EXIST:
                    sendError(
                        res,
                        `Role ${ERORR_MESSAGES.DUPLICATE_ENTRY}`,
                        400
                    )
                    break

                case Status.SUCCESS:
                    sendSuccess(res, SUCCESS_MESSAGES.CREATED, {
                        Role: result.role,
                    })
                    break
                case RoleStatus.SUPER_ADMIN_NOT_ALLOWED:
                    sendError(res, `${RoleStatus.SUPER_ADMIN_NOT_ALLOWED}`, 403)
                    break
                default:
                    sendError(res, ERORR_MESSAGES.SERVER, 400)
                    break
            }
            return
        } catch (error) {
            return sendError(res, ERORR_MESSAGES.SERVER, 500, error)
        }
    }
    getRole = async (req: Request, res: Response) => {
        try {
            const Role = await this.roleService.getRole()

            return sendSuccess(res, SUCCESS_MESSAGES.FETCHED, Role)
        } catch (error) {
            return sendError(res, ERORR_MESSAGES.SERVER, 500, error)
        }
    }

    updateRole = async (req: Request, res: Response) => {
        try {
            let { id, updatedBy, name } = req.body
            const missingFields = ['id', 'name', 'updatedBy'].filter(
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
                ;({ id, name, updatedBy } = DataSanitize({
                    id,
                    name,
                    updatedBy,
                }))
            } catch (sanitizeError: unknown) {
                console.log(sanitizeError, 'sanitizeError')

                sendError(res, ERORR_MESSAGES.INVALID_INPUT, 400)
                return
            }
            const data = new UpdateRoleDTO(id, name, updatedBy)
            const result = await this.roleService.updateRole(data)
            if (result.status === RoleStatus.SYSTEM_ROLE_NOT_ALLOWED) {
                return sendError(
                    res,
                    'System roles You Entered cannot be created or modified'
                )
            }
            if (result.status === Status.NAME_NOT_EXIST) {
                return sendError(res, `Role ${Status.NAME_NOT_EXIST}`)
            }
            if (result.status === Status.NAME_ALREADY_EXIST) {
                return sendError(res, `Role ${ERORR_MESSAGES.DUPLICATE_ENTRY}`)
            }

            if (result.status === Status.SUCCESS) {
                return sendSuccess(res, SUCCESS_MESSAGES.UPDATED)
            }
        } catch (error) {
            return sendError(res, ERORR_MESSAGES.SERVER, 500, error)
        }
    }
}
