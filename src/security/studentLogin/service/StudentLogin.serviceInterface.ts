import { QueryRunner } from 'typeorm'
import { StudentLoginDTO } from '../controller/StudentLogin.DTO'
import { StudentLoginResult } from '../types/StudentLogin.types'

export interface StudentLoginServiceMethods {
    studentLoginService(admissionNumber: string, password: string): Promise<any>
    // studentLoginServiceForMobile(admissionNumber: string, password: string): any

    addStudentForLogin(
        data: StudentLoginDTO,
        queryRunner: QueryRunner
    ): Promise<StudentLoginResult>
    updateStudentPassword(
        studentId: number,
        password: string,
        queryRunner: QueryRunner
    ): Promise<void>
}
