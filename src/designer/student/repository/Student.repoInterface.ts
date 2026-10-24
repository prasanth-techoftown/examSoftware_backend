import { GetPaginationOptions } from '../../../constant/Result.types'
import { BranchStudent, StudentInfo } from '../types/Student.types'

export interface StudentRepositoryMethods {
    getStudentForDesigner(
        options: GetPaginationOptions,
        perBranchLimit: number
    ): Promise<{ student: StudentInfo[]; total: number }>

    getStudentsForBranch(
        branchId: string,
        options: { limit?: number; offset?: number; search?: string }
    ): Promise<{ students: BranchStudent[]; total: number }>
}
