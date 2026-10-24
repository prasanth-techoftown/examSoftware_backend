import { ExamStatus } from '../types/ExamRequest.types'

export class UpdateExamRequestDTO {
    private readonly id: number
    private readonly studentId: number
    private readonly status: ExamStatus
    private readonly updatedBy: string
    private readonly date: string
    private readonly time: string
    private readonly examDate: string
    private readonly reason?: string | null

    constructor(
        id: number,
        studentId: number,
        status: ExamStatus,
        updatedBy: string,
        date: string,
        time: string,
        examDate: string,
        reason: string | null
    ) {
        this.id = id
        this.studentId = studentId
        this.status = status
        this.updatedBy = updatedBy
        this.date = date
        this.time = time
        this.examDate = examDate
        this.reason = reason
    }

    getId(): number {
        return this.id
    }
    getExamDate(): string {
        return this.examDate
    }
    getStudentId(): number {
        return this.studentId
    }
    getDate(): string {
        return this.date
    }
    getTime(): string {
        return this.time
    }
    getStatus(): ExamStatus {
        return this.status
    }
    getUpdatedBy(): string {
        return this.updatedBy
    }
    getReason(): string | null {
        return this.reason ?? null
    }
}
