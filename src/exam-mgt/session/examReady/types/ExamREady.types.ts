export type ExamReadyDetails = {
    id: number
    firstName: string
    lastName: string
    admissionNumber: string
    courseName: string
    courseId: number
    academicYear: number
    email: string
    phoneNumber: string
    gender: string
    branchName: string | null

    scheduleId: number | null
    examDate: string | number
    scheduleStatus: string | null

    totalQuestions: number | null
    subjectTotalQuestion: number | null
    durationMinutes: number | null
}

export interface ExamReadyResponse {
    student: {
        id: number
        firstName: string
        lastName: string
        admissionNumber: string
        courseName: string
        courseId: number
        academicYear: number
        email: string
        phoneNumber: string
        gender: string
        branchName: string | null
    }
    exam: {
        scheduleId: number | null
        examDate: string | number
        scheduleStatus: string | null

        totalQuestions: number | null
        durationMinutes: number | null
    }
}
