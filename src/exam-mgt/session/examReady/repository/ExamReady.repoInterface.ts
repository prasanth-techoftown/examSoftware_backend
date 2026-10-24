import { ExamReadyDetails } from '../types/ExamREady.types'

export interface ExamReadyRepoMethods {
    getExamReadyDetails(studentId: number): Promise<ExamReadyDetails | null>
}
