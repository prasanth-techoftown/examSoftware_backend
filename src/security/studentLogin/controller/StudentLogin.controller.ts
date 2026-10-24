import { inject, injectable } from 'tsyringe'
import { Request, Response } from 'express'
import { DataSanitize } from '../../../utils/DataSanitize'
import { sendError, sendSuccess } from '../../../utils/Response'
import { ERORR_MESSAGES } from '../../../constant/Error.message'

import { StudentLoginServiceMethods } from '../service/StudentLogin.serviceInterface'
import { Status } from '../../../constant/Result.types'
import { StudentLoginStatus } from '../types/StudentLogin.types'
import { ROLE, RoleType } from '../../../constant/enum/Role.enum'

@injectable()
export class StudentLoginController {
    constructor(
        @inject('StudentLoginService')
        private studentLoginService: StudentLoginServiceMethods
    ) {}

    studentLoginController = async (req: Request, res: Response) => {
        try {
            const ip =
                req.headers['x-forwarded-for']?.toString().split(',')[0] ||
                req.socket.remoteAddress
            console.log(ip, 'ip')
            let { admissionNumber, password } = req.body
            const missingFields = ['admissionNumber', 'password'].filter(
                (field) => !req.body[field]
            )

            if (missingFields.length > 0) {
                sendError(
                    res,
                    `${ERORR_MESSAGES.MISSING_FIELD}: ${missingFields.join(', ')}`,
                    400
                )
                return
            }

            try {
                ;({ admissionNumber, password } = DataSanitize({
                    admissionNumber,
                    password,
                }))
            } catch (sanitizeError: unknown) {
                console.log(sanitizeError, 'sanitizeError')

                sendError(res, ERORR_MESSAGES.INVALID_INPUT, 400)
                return
            }
            console.log(admissionNumber.trim().toUpperCase())

            const result = await this.studentLoginService.studentLoginService(
                admissionNumber.trim().toUpperCase(),
                password.trim()
            )

            if (result.status === StudentLoginStatus.NOT_SCHEDULED_TODAY) {
                return sendError(
                    res,
                    StudentLoginStatus.NOT_SCHEDULED_TODAY,
                    404
                )
            }

            if (result.status === StudentLoginStatus.EXAM_ALREADY_COMPLETED) {
                return sendError(
                    res,
                    StudentLoginStatus.EXAM_ALREADY_COMPLETED,
                    404
                )
            }
            if (result.status === StudentLoginStatus.EXAM_SUSPENDED) {
                return sendError(res, StudentLoginStatus.EXAM_SUSPENDED, 404)
            }
            if (result.status === StudentLoginStatus.USER_NOT_FOUND) {
                return sendError(
                    res,
                    `${StudentLoginStatus.INVALID_CREDENTIALS}:${StudentLoginStatus.USER_NOT_FOUND}`,
                    404
                )
            }
            if (result.status === StudentLoginStatus.INVALID_CREDENTIALS) {
                return sendError(
                    res,
                    `${StudentLoginStatus.INVALID_CREDENTIALS}`,
                    404
                )
            }
            if (result.status === StudentLoginStatus.WRONG_PASSWORD) {
                return sendError(
                    res,
                    `${StudentLoginStatus.INVALID_CREDENTIALS}:${StudentLoginStatus.INVALID_PASSWORD}`,
                    400
                )
            }
            if (result.status === Status.SUCCESS) {
                const { studentLogin } = result
                req.session.user = {
                    userId: studentLogin.studentId,
                    role: ROLE.STUDENT as RoleType,
                    userType: ROLE.STUDENT,
                }
                // console.log(result)
                await new Promise((resolve, reject) => {
                    req.session.save((err) => {
                        if (err) reject(err)
                        else resolve(true)
                    })
                })
                return sendSuccess(res, `Login Succesfully!`, 200)
            }
        } catch (error) {
            console.log(error, 'error')

            return sendError(res, 'Internal Server Error', 500, error)
        }
    }
}
