import { UpdateUserDTO } from '../../user/controller/UpdateUser.DTO'
import { UserDTO } from '../../user/controller/User.DTO'
import { AdminResult } from '../types/Admin.types'

export interface AdminServiceMethods {
    addAdmin(data: UserDTO): Promise<AdminResult>
    getAdmin(): Promise<AdminResult>
    updateAdmin(data: UpdateUserDTO): Promise<AdminResult>
    deleteAdmin(AdminId: string, deletedBy: string): Promise<AdminResult>
}
