import { ResultSetHeader } from 'mysql2'
import { GetPaginationOptions } from '../../constant/Result.types'
import { StudentInfo } from '../types/Student.types'
import { StudentDTO } from '../controller/Student.DTO'
import { UpdateStudentDTO } from '../controller/UpdateStudent.DTO'
import { QueryRunner } from 'typeorm'

export interface StudentRepositoryMethods {
    getAllStudent(
        options: GetPaginationOptions
    ): Promise<{ student: StudentInfo[]; total: number }>
    addStudent(data: StudentDTO, queryRunner?: QueryRunner): Promise<number>
    updateStudent(data: UpdateStudentDTO): Promise<ResultSetHeader>
    getStudentById(id: number): Promise<StudentInfo | null>
}
