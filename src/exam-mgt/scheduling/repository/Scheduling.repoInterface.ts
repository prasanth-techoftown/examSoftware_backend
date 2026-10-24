import { ResultSetHeader } from 'mysql2'
import { SchedulingInfo } from '../types/Scheduling.types'
import { GetPaginationOptions } from '../../../constant/Result.types'
import { StudentInfo } from '../../../student/types/Student.types'
import { QueryRunner } from 'typeorm'

export interface SchedulingRepositoryMethods {
    getAllScheduling(
        options: GetPaginationOptions,
        status: string
    ): Promise<{ scheduling: SchedulingInfo[]; total: number }>
    addScheduling(
        examDate: string,
        studentId: number,
        examRequestId: number | null,
        createdBy: string,
        queryRunner: QueryRunner
    ): Promise<ResultSetHeader>
    getStudentById(
        studentId: number,
        queryRunner: QueryRunner
    ): Promise<StudentInfo[]>

    updateExamScheduleStatus(
        examSchedulingId: number,
        updatedBy: string,
        queryRunner: QueryRunner
    ): Promise<ResultSetHeader>
    getLatestSchedulingStatus(
        studentId: number,
        queryRunner: QueryRunner
    ): Promise<{ status: string; name: string }[]>

    getCourseScheduleStats(courseIds: number[]): Promise<
        {
            courseId: number
            questionCount: number
            mappingCount: number
        }[]
    >
}
