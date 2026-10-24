import { JwtPayload } from 'jsonwebtoken'
import { TokenType } from '../Enums'
import { RoleType } from '../../constant/enum/Role.enum'

export interface AppJwtPayload extends JwtPayload {
    mod: TokenType
    role: RoleType
    branchId: number
}
