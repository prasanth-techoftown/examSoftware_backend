export type SelectedType = {
    studentId: number
    examRequestId: number
}

export class SchedulingDTO {
    private readonly examDate: string
    public selected: SelectedType[]
    private readonly createdBy: string

    constructor(examDate: string, selected: SelectedType[], createdBy: string) {
        this.examDate = examDate
        this.selected = selected
        this.createdBy = createdBy
    }

    getExamDate(): string {
        return this.examDate
    }
    getSelected(): SelectedType[] {
        return this.selected
    }
    getCreatedBy(): string {
        return this.createdBy
    }
}
