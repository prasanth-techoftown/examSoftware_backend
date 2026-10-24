import { LoginUserRow } from '../types/login.types'

export interface LoginRepositoryMethods {
    loginRepository(userName: string): Promise<LoginUserRow[]>
}
