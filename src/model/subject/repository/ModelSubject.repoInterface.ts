import { ResultSetHeader } from 'mysql2'
import { ModelSubjectDTO } from '../controller/ModelSubject.DTO'
import { CourseInfo } from '../types/ModelSubject.types'
import { GetPaginationOptions } from '../../../constant/Result.types'
import { UpdateModelSubjectDTO } from '../controller/UpdateModelSubject.DTO'

export interface ModelSubjectRepositoryMethods {
    getAllCourse(
        options: GetPaginationOptions
    ): Promise<{ courses: CourseInfo[]; total: number }>
    addCourse(data: ModelSubjectDTO): Promise<ResultSetHeader>
    updateCourse(data: UpdateModelSubjectDTO): Promise<ResultSetHeader>
}
