import { injectable } from 'tsyringe'
import { AppDataSource } from '../../../config/data-source'
import { StudentLoginRepositoryMethods } from './StudentLogin.repoInterface'
import { ResultSetHeader } from 'mysql2'
import { StudentLoginDTO } from '../controller/StudentLogin.DTO'
import { QueryRunner } from 'typeorm'
import { ExamSchedule, StudentLoginInfo } from '../types/StudentLogin.types'

@injectable()
export class StudentLoginRepository implements StudentLoginRepositoryMethods {
    addStudentForLogin = async (
        data: StudentLoginDTO,
        queryRunner: QueryRunner
    ): Promise<ResultSetHeader> => {
        const manager = queryRunner
            ? queryRunner.manager
            : AppDataSource.manager

        return manager.query(
            `INSERT INTO sem_studentLogin
         (admissionNumber, password, studentId, createdBy)
         VALUES (?,?,?,?)`,
            [
                data.getAdmissionNumber(),
                data.getPassword(),
                data.getStudentId(),
                data.getCreatedBy(),
            ]
        )
    }

    updateStudentPassword = async (
        studentId: number,
        password: string,
        queryRunner: QueryRunner
    ): Promise<void> => {
        await queryRunner.query(
            `
        UPDATE sem_studentLogin
        SET password = ?,
            updatedAt = NOW()
        WHERE studentId = ?
        `,
            [password, studentId]
        )
    }
    studentLoginRepository = async (
        admissionNumber: string
    ): Promise<StudentLoginInfo[]> => {
        return AppDataSource.manager.query(
            `
  SELECT
ss.id,
ss.admissionNumber,ss.password,ss.studentId
FROM sem_studentLogin ss

WHERE ss.isDeleted = 0
  AND ss.admissionNumber = ?;
    `,
            [admissionNumber]
        )
    }
    getTodayScheduleByStudentId = async (
        studentId: number
    ): Promise<ExamSchedule[]> => {
        return AppDataSource.manager.query(
            `
        SELECT 
            s.id,
            s.examDate,
            s.status,
            ss.exam_session_status
        FROM sem_exam_schedule s
        LEFT JOIN sem_exam_session ss
            ON s.studentId = ss.studentId
        WHERE s.studentId = ?
          AND s.isDeleted = 0
        ORDER BY s.id DESC
        LIMIT 1
        `,
            [studentId]
        )
    }
}
