import { ExamSessionStatus } from '../types/ExamSession.types'

export class ExamSessionDTO {
    private readonly examSessionStatus: ExamSessionStatus
    private readonly studentId: number
    private readonly examSchedulingId: number
    private readonly totalQuestion: number
    private readonly createdBy: string
    private readonly startedAt: string

    constructor(
        examSessionStatus: ExamSessionStatus,
        studentId: number,
        examSchedulingId: number,
        totalQuestion: number,
        createdBy: string,
        startedAt: string
    ) {
        this.examSessionStatus = examSessionStatus
        this.studentId = studentId
        this.examSchedulingId = examSchedulingId
        this.totalQuestion = totalQuestion
        this.createdBy = createdBy
        this.startedAt = startedAt
    }

    getExamSessionStatus(): ExamSessionStatus {
        return this.examSessionStatus
    }
    getStudentId(): number {
        return this.studentId
    }
    getExamSchedulingId(): number {
        return this.examSchedulingId
    }
    getTotalQuestion(): number {
        return this.totalQuestion
    }
    getCreatedBy(): string {
        return this.createdBy
    }
    getStartedAt(): string {
        return this.startedAt
    }
}
