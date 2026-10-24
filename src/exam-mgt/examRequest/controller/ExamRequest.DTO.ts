export class ExamRequestDTO {
    private readonly studentId: number
    private readonly examDate: string | null
    private readonly date: string
    private readonly time: string
    private readonly createdBy: string

    constructor(
        studentId: number,
        examDate: string | null,
        date: string,
        time: string,
        createdBy: string
    ) {
        this.studentId = studentId
        this.examDate = examDate 
        this.date = date
        this.time = time
        this.createdBy = createdBy
    }
    getStudentId(): number {
        return this.studentId
    }

    getExamDate(): string |null{
        return this.examDate ?? null
    }
    getDate(): string {
        return this.date
    }

    getTime(): string {
        return this.time
    }
    getCreatedBy(): string {
        return this.createdBy
    }
}
