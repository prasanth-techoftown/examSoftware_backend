import { inject, injectable } from 'tsyringe'
import { Request, Response } from 'express'
import { DataSanitize } from '../../../utils/DataSanitize'
import { sendError, sendSuccess } from '../../../utils/Response'
import { ERORR_MESSAGES } from '../../../constant/Error.message'
import { LoginStatus } from '../types/login.types'
import { LoginServiceMethods } from '../service/Login.serviceInterface'
import { ROLE, RoleType } from '../../../constant/enum/Role.enum'
import { RoleModuleAccessService } from '../../../Rbac/roleModuleAccess/service/RoleModuleAccess.service'
import {
    formatPermissions,
    formatPermissionsFromRows,
} from '../../../utils/formatePermission'
import {
    RoleModuleAccessInfo,
    RoleModuleAccessInfoRow,
} from '../../../Rbac/roleModuleAccess/types/RoleModule.types'

@injectable()
export class LoginController {
    constructor(
        @inject('LoginService') private loginService: LoginServiceMethods,
        @inject('RoleModuleAccessService')
        private modulePermission: RoleModuleAccessService
    ) {}
    loginController = async (req: Request, res: Response) => {
        try {
            // console.log(req.body)
            const deviceType =
                (req as any).device?.type?.toUpperCase() || 'UNKNOWN'
            console.log(`Login attempt from: ${deviceType}`)
            const ip =
                req.headers['x-forwarded-for']?.toString().split(',')[0] ||
                req.socket.remoteAddress
            console.log(ip, 'ip')

            let {
                userName,
                password,
                deviceId,
                date,
                time,
                userAgent,
                platform,
                language,
                timeZone,
                screen,
            } = req.body

            const missingFields = [
                'userName',
                'password',
                'deviceId',
                'date',
                'time',
                'userAgent',
                'platform',
                'language',
                'timeZone',
                'screen',
            ].filter((field) => !req.body[field])

            if (missingFields.length > 0) {
                sendError(
                    res,
                    `${ERORR_MESSAGES.MISSING_FIELD}: ${missingFields.join(', ')}`,
                    400
                )
                return
            }

            try {
                ;({ userName, password } = DataSanitize({ userName, password }))
            } catch (sanitizeError: unknown) {
                console.log(sanitizeError, 'sanitizeError')

                sendError(res, ERORR_MESSAGES.INVALID_INPUT, 400)
                return
            }

            userName = userName.toLowerCase()
            // const clientInfoFetcher = new ClientInfoFetcher(req)
            // const clientInfo = clientInfoFetcher.getInfo()
            const result = await this.loginService.loginService(
                userName,
                password,
                deviceId,
                date,
                time,
                userAgent,
                platform,
                language,
                timeZone,
                screen,
                ip
                // clientInfo
            )
            console.log(result);
            

            if (result.status === LoginStatus.USER_NOT_FOUND) {
                return sendError(
                    res,
                    `${LoginStatus.INVALID_CREDENTIALS}:${LoginStatus.USER_NOT_FOUND}`,
                    404
                )
            }
            if (result.status === LoginStatus.INVALID_CREDENTIALS) {
                return sendError(res, `${LoginStatus.INVALID_CREDENTIALS}`, 404)
            }
            if (result.status === LoginStatus.WRONG_PASSWORD) {
                return sendError(
                    res,
                    `${LoginStatus.INVALID_CREDENTIALS}:${LoginStatus.INVALID_PASSWORD}`,
                    400
                )
            }
            if (result.status === LoginStatus.DEVICE_REJECTED) {
                return sendError(res, `${LoginStatus.DEVICE_REJECTED}`, 403)
            }
            if (result.status === LoginStatus.UNAUTHORIZED_DEVICE) {
                return sendError(res, `${LoginStatus.UNAUTHORIZED_DEVICE}`, 400)
            }
            if (result.status === LoginStatus.SUCCESS) {
                const { login } = result

                req.session.user = {
                    userId: login.userId,
                    role: login.role as RoleType,
                    userType: ROLE.SUPERADMIN,
                }
                req.session.sessionId = req.sessionID
                const rawPermissions =
                    await this.modulePermission.getRoleModuleAccessById(
                        login.userId
                    )

                const rawData = rawPermissions.roleModuleAccess

                const formattedPermissions =
                    Array.isArray(rawData) && rawData.length > 0
                        ? 'access' in rawData[0]
                            ? formatPermissions(
                                  rawData as RoleModuleAccessInfo[]
                              )
                            : formatPermissionsFromRows(
                                  rawData as RoleModuleAccessInfoRow[]
                              )
                        : {}
                req.session.permissions = formattedPermissions
                await new Promise((resolve, reject) => {
                    req.session.save((err) => {
                        if (err) reject(err)
                        else resolve(true)
                    })
                })
                sendSuccess(res, 'Login successful')
                return
            }
        } catch (error) {
            console.log(error, 'error')

            return sendError(res, 'Internal Server Error', 500, error)
        }
    }

    private generateOtp(): string {
        return Math.floor(100000 + Math.random() * 900000).toString()
    }
}
