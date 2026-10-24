import { LoginResult } from '../types/login.types'

export interface LoginServiceMethods {
    loginService(
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
    ): Promise<LoginResult>
    loginServiceForMobile(userName: string, password: string): any
}
