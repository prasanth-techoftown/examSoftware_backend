import { Request, Response } from 'express'
import { inject, injectable } from 'tsyringe'
import { DataSanitize } from '../../utils/DataSanitize'
import { sendError, sendSuccess } from '../../utils/Response'
import { ERORR_MESSAGES } from '../../constant/Error.message'
import { SUCCESS_MESSAGES } from '../../constant/Success.message'
import { UserStatus } from '../types/User.types'
import { UserServiceMethods } from '../service/User.serviceInterface'
import { Status } from '../../constant/Result.types'
import { UserDTO } from './User.DTO'

@injectable()
export class UserController {
    constructor(
        @inject('UserService')
        private userService: UserServiceMethods
    ) {}
    userRegistration = async (req: Request, res: Response) => {
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
                'lastName',
                'userName',
                'email',
                'createdBy',
                'phoneNumber',
                'roleId',
            ].filter((field) => !req.body[field])

            if (missingFields.length > 0) {
                return sendError(
                    res,
                    `${ERORR_MESSAGES.MISSING_FIELD} ${missingFields.join(', ')}`,
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
            } catch (error) {
                console.log(error, 'sanitize error')

                sendError(res, ERORR_MESSAGES.INVALID_INPUT, 400)
                return
            }

            const data = new UserDTO(
                firstName,
                lastName,
                userName,
                email,
                roleId,
                phoneNumber,
                createdBy
            )
            const userResult = await this.userService.userRegistration(data)
            if (userResult.status === UserStatus.USERNAME_ALREADY_EXIST)
                return sendError(res, UserStatus.USERNAME_ALREADY_EXIST, 409)
            if (userResult.status === UserStatus.USER_ALREADY_EXIST)
                return sendError(res, UserStatus.USER_ALREADY_EXIST, 409)

            if (userResult.status !== Status.SUCCESS)
                return sendError(res, ERORR_MESSAGES.USER_CREATION_ERROR, 400)

            return sendSuccess(res, SUCCESS_MESSAGES.CREATED, {
                user: userResult.user,
            })
        } catch (error) {
            return sendError(
                res,
                ERORR_MESSAGES.USER_CREATION_ERROR,
                500,
                error
            )
        }
    }
    getUserById = async (req: Request, res: Response) => {
        try {
            const userId = String(req.query.id)

            if (!userId) {
                return sendError(res, 'user ID required', 400)
            }
            const User = await this.userService.getUserById(userId)
            return sendSuccess(res, SUCCESS_MESSAGES.FETCHED, User)
        } catch (error) {
            return sendError(res, ERORR_MESSAGES.SERVER, 500, error)
        }
    }
    updatePassword = async (req: Request, res: Response) => {
        try {
            const { oldPassword, newPassword, userId } = req.body

            const missingFields = [
                'oldPassword',
                'newPassword',
                'userId',
            ].filter((f) => !req.body[f])

            if (missingFields.length) {
                return sendError(
                    res,
                    `${ERORR_MESSAGES.MISSING_FIELD}: ${missingFields.join(', ')}`,
                    400
                )
            }

            const result = await this.userService.updatePassword(
                userId,
                oldPassword.trim(),
                newPassword.trim()
            )

            if (result.status === UserStatus.USER_NOT_FOUND) {
                return sendError(res, `user ${ERORR_MESSAGES.NOT_FOUND}`, 404)
            }

            if (result.status === UserStatus.WRONG_PASSWORD) {
                return sendError(res, 'Old password is incorrect', 400)
            }
            if (result.status === UserStatus.DUPLICATE) {
                return sendError(res, UserStatus.DUPLICATE, 409)
            }

            return sendSuccess(res, SUCCESS_MESSAGES.UPDATED)
        } catch (error) {
            return sendError(res, ERORR_MESSAGES.SERVER, 500, error)
        }
    }
}
