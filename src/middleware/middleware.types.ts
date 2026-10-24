import { Request } from 'express'
import { RoleType } from '../constant/enum/Role.enum'

export interface SessionAuthRequest extends Request {
    user?: {
        userId: string
        role: RoleType
    }
}
