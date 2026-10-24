import { Status } from '../../../../constant/Result.types'
import { ExamReadyResponse } from '../types/ExamREady.types'

export interface ExamReadyServiceMethods {
    getExamReadyDetails(studentId: number): Promise<{
        status: Status
        data: ExamReadyResponse
    }>
}
