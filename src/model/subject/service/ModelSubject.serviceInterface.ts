import { GetPaginationOptions } from '../../../constant/Result.types'
import { ModelSubjectDTO } from '../controller/ModelSubject.DTO'
import { UpdateModelSubjectDTO } from '../controller/UpdateModelSubject.DTO'
import { CourseResult } from '../types/ModelSubject.types'

export interface ModelSubjectServiceMethods {
    getAllCourse(options: GetPaginationOptions): Promise<CourseResult>
    addCourse(data: ModelSubjectDTO): Promise<CourseResult>
    updateCourse(data: UpdateModelSubjectDTO): Promise<CourseResult>
}
