import { GetPaginationOptions } from '../../../constant/Result.types'
import { ExamRequestDTO } from '../controller/ExamRequest.DTO'
import { UpdateExamRequestDTO } from '../controller/UpdateExamRequest.DTO'
import { ExamRequestResult } from '../types/ExamRequest.types'

export interface ExamRequestServiceMethods {
    addExamRequest(module: ExamRequestDTO[]): Promise<ExamRequestResult>
    updateExamRequest(module: UpdateExamRequestDTO): Promise<ExamRequestResult>
    getExamRequests(options: GetPaginationOptions): Promise<ExamRequestResult>
    getStudentByStatus(
        options: GetPaginationOptions,
        status: string
    ): Promise<ExamRequestResult>
    getExamRequestStudentsForBranch(
        branchId: string,
        options: { limit?: number; offset?: number; search?: string }
    ): Promise<ExamRequestResult>


    getStudentByStatusForBranch(
        branchId: string,
        options: { limit?: number; offset?: number; search?: string },
        status: string
    ): Promise<ExamRequestResult>
}
