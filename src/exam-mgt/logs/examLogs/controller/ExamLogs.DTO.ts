import { ExamActivityAction } from '../types/ExamLogs.types'

export class ExamLogsDTO {
    private readonly studentId: number
    private readonly examSessionId?: number
    private readonly grade?: string
    private readonly score?: number
    private readonly percentage?: number
    private readonly result?: string
    private readonly action: ExamActivityAction

    constructor(
        studentId: number,
        action: ExamActivityAction,
        examSessionId?: number,
        grade?: string,
        score?: number,
        percentage?: number,
        result?: string
    ) {
        this.studentId = studentId
        this.examSessionId = examSessionId
        this.grade = grade
        this.score = score
        this.percentage = percentage
        this.result = result
        this.action = action
    }

    getStudentId(): number {
        return this.studentId
    }
    getExamSessionId(): number | null {
        return this.examSessionId ?? null
    }
    getScore(): number | null {
        return this.score ?? null
    }
    getGrade(): string | null {
        return this.grade ?? null
    }
    getPercentage(): number | null {
        return this.percentage ?? null
    }
    getResult(): string | null {
        return this.result ?? null
    }
    getAction(): string {
        return this.action
    }
}
