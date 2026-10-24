import { inject, injectable } from 'tsyringe'
import { LoginInfo, LoginResult, LoginStatus } from '../types/login.types'
import bcrypt from 'bcrypt'
import { AppError } from '../../../constant/App.error'
import { AppDataSource } from '../../../config/data-source'
import {
    DeviceApproval,
    Status,
} from '../../DeviceApproval/entity/DeviceApproval'
import { ROLE } from '../../../constant/enum/Role.enum'
import { LoginServiceMethods } from './Login.serviceInterface'
import { LoginRepositoryMethods } from '../repository/Login.repoInterface'

@injectable()
export class LoginService implements LoginServiceMethods {
    private deviceApproval
    constructor(
        @inject('LoginRepository')
        private loginRepository: LoginRepositoryMethods
    ) {
        this.deviceApproval = AppDataSource.getRepository(DeviceApproval)
    }

    loginService = async (
        userName: string,
        password: string,
        deviceId: string,
        date: string,
        time: string,
        userAgent: string,
        platform: string,
        language: string,
        timezone: string,
        screen: string,
        ip: string | undefined
    ): Promise<LoginResult> => {
        try {
            const result = await this.loginRepository.loginRepository(userName)

            if (!result || result.length === 0) {
                return { status: LoginStatus.USER_NOT_FOUND }
            }

            const user = result[0]
            if (!user.role) {
                return { status: LoginStatus.INVALID_CREDENTIALS }
            }
            const isPasswordMatch = await bcrypt.compare(
                password,
                user.password
            )
            if (!isPasswordMatch) {
                return { status: LoginStatus.WRONG_PASSWORD }
            }
            //  console.log(result)
            // console.log("Device ID:", deviceId);
            // console.log("DB fingerprint:", user.deviceFingerprint);
            if (user.role === ROLE.SUPERADMIN) {
                const { password: _, ...userWithoutPassword } = user
                return {
                    status: LoginStatus.SUCCESS,
                    login: {
                        ...userWithoutPassword,
                        userId: user.userId.toString(),
                        branchId: user.branchId,
                        // sessionId:sessionId
                    } as LoginInfo,
                }
            }
            // console.log("User object keys:", Object.keys(user));
            const formattedDeviceId = deviceId.trim()
            console.log(
                user.deviceFingerprint === formattedDeviceId,
                'deviceIdchecking'
            )

            if (user.deviceFingerprint === deviceId) {
                const { password: _, ...userWithoutPassword } = user
                return {
                    status: LoginStatus.SUCCESS,
                    login: {
                        ...userWithoutPassword,
                        userId: user.userId.toString(),
                        branchId: user.branchId,
                        // sessionId:sessionId
                    } as LoginInfo,
                }
            }
            if (!user.deviceFingerprint) {
                // First-time login: save device
                // await this.userRepository.update(
                //     { id: user.userId },
                //     { deviceFingerprint: deviceId }
                // )
                const { password: _, ...userWithoutPassword } = user
                return {
                    status: LoginStatus.SUCCESS,
                    login: {
                        ...userWithoutPassword,
                        userId: user.userId.toString(),
                        branchId: user.branchId ?? 0,
                        // sessionId:sessionId
                    } as LoginInfo,
                }
                // user.deviceFingerprint = deviceId;
            }
            console.log(user.deviceFingerprint, 'deviceFingerprint')

            if (user.deviceFingerprint !== deviceId) {
                const existingApproval = await this.deviceApproval.findOne({
                    where: {
                        userId: user.userId.toString(),
                        newDevice: deviceId,
                    },
                })

                if (existingApproval) {
                    if (existingApproval.status === Status.PENDING) {
                        return { status: LoginStatus.UNAUTHORIZED_DEVICE }
                    }

                    if (existingApproval.status === Status.REJECTED) {
                        return { status: LoginStatus.DEVICE_REJECTED }
                    }

                    if (existingApproval.status === Status.APPROVED) {
                        const { password: _, ...userWithoutPassword } = user
                        return {
                            status: LoginStatus.SUCCESS,
                            login: {
                                ...userWithoutPassword,
                                userId: user.userId.toString(),

                                branchId: user.branchId,
                            } as LoginInfo,
                        }
                    }
                }

                await this.deviceApproval.save({
                    userId: user.userId.toString(),
                    userName: userName,
                    oldDevice: user.deviceFingerprint,
                    newDevice: deviceId,
                    status: Status.PENDING,
                    userAgent,
                    date,
                    time,
                    platform,
                    language,
                    timezone,
                    screen,
                    ipAddress: ip,
                })

                return { status: LoginStatus.UNAUTHORIZED_DEVICE }
            }
            return {
                status: LoginStatus.ERROR,
                message: 'Login failed',
            }
        } catch (err) {
            if (err instanceof AppError) throw err
            throw new AppError('Failed to Login', 500)
        }
    }

    loginServiceForMobile = async (userName: string, password: string) => {
        try {
            // 1. Fetch user from repository
            const result = await this.loginRepository.loginRepository(
                userName.toLowerCase()
            )

            if (!result || result.length === 0) {
                return { status: LoginStatus.USER_NOT_FOUND }
            }

            const user = result[0]

            // 2. Validate Password
            const isPasswordMatch = await bcrypt.compare(
                password,
                user.password
            )
            if (!isPasswordMatch) {
                return { status: LoginStatus.WRONG_PASSWORD }
            }

            // 3. (Optional) Check if the user is a Vilora Student
            // If your DB has a 'isStudent' flag or specific role
            // if (user.role !== 'STUDENT') {
            //     // Log this as an unauthorized attempt to access placement portal
            //     console.warn(`Non-student attempt to mobile login: ${userName}`)
            // }

            // 4. Clean up the object (Remove sensitive data)
            // const { password: _, ...userWithoutPassword } = user
            const { password: _, ...userWithoutPassword } = user
            console.log(user)
            return {
                status: LoginStatus.SUCCESS,
                data: {
                    ...userWithoutPassword,
                    userId: user.userId.toString(),
                } as LoginInfo,
            }
        } catch (err) {
            console.error('Error in loginServiceForMobile:', err)

            if (err instanceof AppError) throw err
            throw new AppError(
                'An unexpected error occurred during mobile login',
                500
            )
        }
    }
}
