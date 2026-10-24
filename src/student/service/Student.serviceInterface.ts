import { GetPaginationOptions } from '../../constant/Result.types'
import { StudentDTO } from '../controller/Student.DTO'
import { UpdateStudentDTO } from '../controller/UpdateStudent.DTO'
import { StudentResult } from '../types/Student.types'

export interface StudentServiceMethods {
    getAllStudent(options: GetPaginationOptions): Promise<StudentResult>
    addStudent(data: StudentDTO): Promise<StudentResult>
    updateStudent(data: UpdateStudentDTO): Promise<StudentResult>
    // validateCourseQuestions(courseIds: number[]): Promise<{
    //     valid: number[]
    //     invalid: number[]
    // }>
}
