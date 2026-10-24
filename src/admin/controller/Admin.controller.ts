import { Request, Response } from 'express'
import { inject, injectable } from 'tsyringe'
import { AdminStatus } from '../types/Admin.types'
import { sendError, sendSuccess } from '../../utils/Response'
import { DataSanitize } from '../../utils/DataSanitize'
import { ERORR_MESSAGES } from '../../constant/Error.message'
import { SUCCESS_MESSAGES } from '../../constant/Success.message'
import { AdminServiceMethods } from '../service/Admin.serviceInterface'
import { Status } from '../../constant/Result.types'
import { UserDTO } from '../../user/controller/User.DTO'
import { AppError } from '../../constant/App.error'
import { UpdateUserDTO } from '../../user/controller/UpdateUser.DTO'

@injectable()
export class AdminController {
    constructor(
        @inject('AdminService')
        private AdminService: AdminServiceMethods
    ) {}

    addAdmin = async (req: Request, res: Response) => {
        try {
            let {
                firstName,
                lastName,
                userName,
                email,
                roleId,
                phoneNumber,
                createdBy,
            } = req.body

            const missingFields = [
                'firstName',
                'userName',
                'email',
                'roleId',
                'phoneNumber',
                'createdBy',
            ].filter((field) => !req.body[field])

            if (missingFields.length > 0) {
                return sendError(
                    res,
                    `${ERORR_MESSAGES.MISSING_FIELD}: ${missingFields.join(', ')}`,
                    400
                )
            }

            try {
                ;({
                    firstName,
                    lastName,
                    userName,
                    email,
                    roleId,
                    phoneNumber,
                    createdBy,
                } = DataSanitize({
                    firstName,
                    lastName,
                    userName,
                    email,
                    roleId,
                    phoneNumber,
                    createdBy,
                }))
            } catch (sanitizeError) {
                console.log(sanitizeError, 'sanitizeError')

                sendError(res, ERORR_MESSAGES.INVALID_INPUT, 400)
                return
            }
            userName = userName.toLowerCase()
            email = email.toLowerCase()
            let data: UserDTO
            try {
                data = new UserDTO(
                    firstName,
                    lastName,
                    userName,
                    email,
                    roleId,
                    phoneNumber,
                    createdBy
                )
            } catch (error) {
                console.log(error)
                throw new AppError('User DTO Error From Admin Controller', 404)
            }
            const result = await this.AdminService.addAdmin(data)

            switch (result.status) {
                case AdminStatus.EMAIL_ALREADY_EXIST:
                    sendError(
                        res,
                        `Email ${ERORR_MESSAGES.DUPLICATE_ENTRY}`,
                        409
                    )
                    return
                case AdminStatus.PHONENUMBER_EXIST:
                    sendError(
                        res,
                        `Phone Number ${ERORR_MESSAGES.DUPLICATE_ENTRY}`,
                        409
                    )
                    return
                case AdminStatus.USERNAME_ALREADY_EXIST:
                    sendError(
                        res,
                        `UserName${ERORR_MESSAGES.DUPLICATE_ENTRY}`,
                        409
                    )
                    return

                case Status.ERROR:
                    sendError(res, ERORR_MESSAGES.USER_CREATION_ERROR, 400)
                    return
                case AdminStatus.INVALID_ROLE:
                    sendError(res, `Role ${ERORR_MESSAGES.NOT_FOUND}`, 500)
                    return
                case Status.SUCCESS:
                    sendSuccess(res, SUCCESS_MESSAGES.CREATED, {
                        Admin: result.admin,
                    })
                    return
                default:
                    return sendError(res, ERORR_MESSAGES.SERVER, 500)
            }
        } catch (error) {
            sendError(res, ERORR_MESSAGES.SERVER, 500, error)
        }
    }
    getAdmin = async (req: Request, res: Response) => {
        try {
            const Admin = await this.AdminService.getAdmin()
            sendSuccess(res, SUCCESS_MESSAGES.FETCHED, Admin)
        } catch (error) {
            sendError(res, ERORR_MESSAGES.SERVER, 500, error)
        }
    }
    updateAdmin = async (req: Request, res: Response) => {
        try {
            let {
                id,
                firstName,
                lastName,
                userName,
                email,
                roleId,
                phoneNumber,
                updatedBy,
            } = req.body

            const missingFields = ['id', 'updatedBy'].filter(
                (field) => !req.body[field]
            )

            if (missingFields.length > 0) {
                sendError(
                    res,
                    `${ERORR_MESSAGES.MISSING_FIELD} : ${missingFields.join(', ')}`,
                    400
                )
            }
            try {
                ;({
                    id,
                    firstName,
                    lastName,
                    userName,
                    email,
                    roleId,
                    phoneNumber,
                    updatedBy,
                } = DataSanitize({
                    id,
                    firstName,
                    lastName,
                    userName,
                    email,
                    roleId,
                    phoneNumber,
                    updatedBy,
                }))
            } catch (sanitizeError: unknown) {
                console.log(sanitizeError, 'sanitizeError')

                sendError(res, ERORR_MESSAGES.INVALID_INPUT, 400)
            }
            userName = userName.toLowerCase()
            email = email.toLowerCase()
            const data = new UpdateUserDTO(
                id,
                firstName,
                lastName,
                userName,
                email,
                roleId,
                phoneNumber,
                updatedBy
            )
            const result = await this.AdminService.updateAdmin(data)
            if (result.status === Status.NAME_NOT_EXIST) {
                sendSuccess(res, `User ${Status.NAME_NOT_EXIST}`)
                return
            }
            if (result.status === AdminStatus.EMAIL_ALREADY_EXIST) {
                sendSuccess(res, AdminStatus.EMAIL_ALREADY_EXIST)
                return
            }
            if (result.status === AdminStatus.USERNAME_ALREADY_EXIST) {
                return sendError(
                    res,
                    `UserName ${ERORR_MESSAGES.DUPLICATE_ENTRY}`,
                    409
                )
            }
            if (result.status === Status.SUCCESS) {
                sendSuccess(res, SUCCESS_MESSAGES.UPDATED)
                return
            }
        } catch (error) {
            sendError(res, ERORR_MESSAGES.SERVER, 500, error)
        }
    }

    deleteAdmin = async (req: Request, res: Response) => {
        try {
            let { id, deletedBy } = req.body
            const missingFields = ['id', 'deletedBy'].filter(
                (field) => !req.body[field]
            )

            if (missingFields.length > 0) {
                sendError(
                    res,
                    `${ERORR_MESSAGES.MISSING_FIELD} : ${missingFields.join(', ')}`,
                    400
                )
            }

            try {
                ;({ id, deletedBy } = DataSanitize({ id, deletedBy }))
            } catch (sanitizeError: unknown) {
                console.log(sanitizeError, 'sanitizeError')

                sendError(res, ERORR_MESSAGES.INVALID_INPUT, 400)
                return
            }
            const result = await this.AdminService.deleteAdmin(id, deletedBy)

            if (result.status === Status.NAME_NOT_EXIST) {
                sendSuccess(res, `User ${Status.NAME_NOT_EXIST}`)
            }

            if (result.status === Status.SUCCESS) {
                sendSuccess(res, SUCCESS_MESSAGES.DELETED)
            }
        } catch (error) {
            sendError(res, ERORR_MESSAGES.SERVER, 500, error)
        }
    }
}
