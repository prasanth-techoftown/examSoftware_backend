import { injectable } from 'tsyringe'
import { AppDataSource } from '../../../config/data-source'
import { UserSessionPayload } from '../../ipFounder/IpFounder.Interface'
import { LoginRepositoryMethods } from './Login.repoInterface'
import { LoginUserRow } from '../types/login.types'

@injectable()
export class LoginRepository implements LoginRepositoryMethods {
    loginRepository = async (userName: string): Promise<LoginUserRow[]> => {
        return AppDataSource.manager.query(
            `
  SELECT
  u.id            AS userId,
  u.firstName,
  u.lastName,u.userName,
  u.email,
  u.deviceFingerprint,
u.password,
  r.name AS role

FROM sem_user u

LEFT JOIN sem_role r
  ON r.id = u.roleId
 AND r.isDeleted = 0

LEFT JOIN sem_admin a
  ON a.userId = u.id
 AND a.isDeleted = 0

WHERE u.isDeleted = 0
  AND u.userName = ?;
    `,
            [userName]
        )
    }

    updateUserLoginInfo = async (
        payload: UserSessionPayload
    ): Promise<void> => {
        const query = `
    INSERT INTO user_sessions (
      session_id,
      user_id,
      ip_address,
      browser,
      os,
      device_type,
      socket_id,
      is_active,
      created_at,
      last_active
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 1, NOW(6), NOW(6))
  `

        const values = [
            payload.sessionId,
            payload.userId,
            payload.ipAddress,
            payload.browser,
            payload.os,
            payload.deviceType,
            payload.socketId ?? null,
        ]

        await AppDataSource.manager.query(query, values)
    }
}
