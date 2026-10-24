export class ExamEligibilityDTO {
    private studentId: number

    constructor(studentId: number) {
        this.studentId = studentId
    }

    getStudentId(): number {
        return this.studentId
    }
}
