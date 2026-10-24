import { injectable } from 'tsyringe'
import { AppDataSource } from '../../../config/data-source'
import { RoleRepositoryMethods } from './Role.repoInterface'
import { RoleDTO } from '../controller/Role.DTO'
import { ResultSetHeader } from 'mysql2'
import { UpdateRoleDTO } from '../controller/UpdateRole.DTO'
import { RoleInfo } from '../types/Role.types'

@injectable()
export class RoleRepository implements RoleRepositoryMethods {
    addRole = async (data: RoleDTO): Promise<ResultSetHeader> => {
        return AppDataSource.manager.query(
            `INSERT INTO sem_role 
        (name,createdBy)
         VALUES (?,?)`,
            [data.getName(), data.getCreatedBy()]
        )
    }
    getAllRole = async (): Promise<{ role: RoleInfo[] }> => {
        const query = `SELECT id,name,isSystemRole
    FROM sem_role
    WHERE isDeleted = 0
    ORDER BY updatedAt DESC
  
  `
        const roles = await AppDataSource.manager.query(query)
        return { role: roles }
    }

    updateRole = async (data: UpdateRoleDTO): Promise<ResultSetHeader> => {
        const query = `
            UPDATE sem_role

            SET 
            name = COALESCE(?, name), updatedBy =  COALESCE(?, updatedBy)
            WHERE id = ?;
        `

        const values = [data.getName(), data.getUpdatedBy(), data.getId()]

        return AppDataSource.manager.query(query, values)
    }
}
