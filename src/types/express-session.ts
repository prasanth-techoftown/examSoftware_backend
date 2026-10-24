import 'express-session'
import { RoleType } from '../constant/enum/Role.enum'

declare module 'express-session' {
    interface SessionData {
        user?: {
            userId: string
            role: RoleType
            userType: string
        }
        permissions?: Record<string, string[]>
        sessionId?: string
    }
}
