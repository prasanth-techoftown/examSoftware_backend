import { ResultSetHeader } from 'mysql2'
import { ModelTitleDTO } from '../controller/ModelTitle.DTO'
import { CourseInfo } from '../types/ModelTitle.types'
import { UpdateModelTitleDTO } from '../controller/UpdateModelTitle.DTO'
import { GetPaginationOptions } from '../../../constant/Result.types'

export interface ModelTitleRepositoryMethods {
    getAllCourse(
        options: GetPaginationOptions
    ): Promise<{ courses: CourseInfo[]; total: number }>
    addCourse(data: ModelTitleDTO): Promise<ResultSetHeader>
    updateCourse(data: UpdateModelTitleDTO): Promise<ResultSetHeader>
}
