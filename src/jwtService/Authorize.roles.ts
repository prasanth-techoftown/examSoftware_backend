import { NextFunction, Response } from 'express'
import { RoleType } from '../constant/enum/Role.enum'
import { SessionAuthRequest } from '../middleware/Auth.middleware'

function authorizeRoles(...allowedRoles: RoleType[]) {
    return (req: SessionAuthRequest, res: Response, next: NextFunction) => {
        const role = req.user?.role
        if (!role || !allowedRoles.includes(role)) {
            return res
                .status(403)
                .json({ error: 'Forbidden: Insufficient permissions' })
        }

        next()
    }
}

export { authorizeRoles }
