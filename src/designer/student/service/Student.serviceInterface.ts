import { GetPaginationOptions } from '../../../constant/Result.types'
import { StudentResult } from '../types/Student.types'

export interface StudentServiceMethods {
    getStudentForDesigner(
        options: GetPaginationOptions,
        perBranchLimit: number
    ): Promise<StudentResult>

    getStudentsForBranch(
        branchId: string,
        options: { limit?: number; offset?: number; search?: string }
    ): Promise<StudentResult>
}
