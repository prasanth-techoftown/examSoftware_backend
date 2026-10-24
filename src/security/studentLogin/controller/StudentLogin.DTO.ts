export class StudentLoginDTO {
    private readonly admissionNumber: string
    private readonly password: string
    private readonly studentId: number
    private readonly createdBy: string

    constructor(
        admissionNumber: string,
        password: string,
        studentId: number,
        createdBy: string
    ) {
        this.admissionNumber = admissionNumber
        this.password = password
        this.studentId = studentId
        this.createdBy = createdBy
    }
    getAdmissionNumber(): string {
        return this.admissionNumber
    }
    getPassword(): string {
        return this.password
    }
    getStudentId(): number {
        return this.studentId
    }
    getCreatedBy(): string {
        return this.createdBy
    }
}
