import fs from 'fs'
import path from 'path'
import jwt from 'jsonwebtoken'
import Enums, { TokenType } from './Enums'
import { AppJwtPayload } from './refreshToken/refreshToken.types'
import { RoleType } from '../constant/enum/Role.enum'

const { TOKENTYPE } = Enums

const PRIVATE_KEY_PATH = path.join(process.cwd(), 'keys', 'private.pem')

const PUBLIC_KEY_PATH = path.join(process.cwd(), 'keys', 'public.pem')

export const privateKey = fs.readFileSync(PRIVATE_KEY_PATH, 'utf8')
export const publicKey = fs.readFileSync(PUBLIC_KEY_PATH, 'utf8')

interface TokenPayload {
    role: RoleType
    branchId: number
    sessionId: string
    mod: TokenType
}

export function accessToken(
    role: RoleType,
    branchId: number,
    sessionId: string
): string {
    const payload: TokenPayload = {
        role,
        branchId: branchId,
        sessionId: sessionId,
        mod: TOKENTYPE.ACCESSTOKEN,
    }

    return jwt.sign(payload, privateKey, {
        algorithm: 'RS512',
        expiresIn: '1d',
    })
}

export function refreshToken(
    role: RoleType,
    branchId: number,
    sessionId: string
): string {
    const payload: TokenPayload = {
        role,
        branchId: branchId,
        sessionId: sessionId,
        mod: TOKENTYPE.REFRESHTOKEN,
    }

    return jwt.sign(payload, privateKey, {
        algorithm: 'RS512',
        expiresIn: '1w',
    })
}

export function verifyToken(token: string): AppJwtPayload | null {
    try {
        return jwt.verify(token, publicKey, {
            algorithms: ['RS512'],
        }) as AppJwtPayload
    } catch (error) {
        console.log(error, 'error')

        return null
    }
}
