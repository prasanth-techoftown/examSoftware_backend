import { ResultSetHeader } from 'mysql2'
import { StudentLoginDTO } from '../controller/StudentLogin.DTO'
import { QueryRunner } from 'typeorm'
import { ExamSchedule, StudentLoginInfo } from '../types/StudentLogin.types'

export interface StudentLoginRepositoryMethods {
    studentLoginRepository(admissionNumber: string): Promise<StudentLoginInfo[]>
    addStudentForLogin(
        data: StudentLoginDTO,
        queryRunner: QueryRunner
    ): Promise<ResultSetHeader>
    getTodayScheduleByStudentId(studentId: number): Promise<ExamSchedule[]>
    updateStudentPassword(
        studentId: number,
        password: string,
        queryRunner: QueryRunner
    ): Promise<void>
}
