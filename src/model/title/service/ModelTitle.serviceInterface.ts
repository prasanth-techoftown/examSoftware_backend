import { GetPaginationOptions } from '../../../constant/Result.types'
import { ModelTitleDTO } from '../controller/ModelTitle.DTO'
import { UpdateModelTitleDTO } from '../controller/UpdateModelTitle.DTO'
import { CourseResult } from '../types/ModelTitle.types'

export interface ModelTitleServiceMethods {
    getAllCourse(options: GetPaginationOptions): Promise<CourseResult>
    addCourse(data: ModelTitleDTO): Promise<CourseResult>
    updateCourse(data: UpdateModelTitleDTO): Promise<CourseResult>
}
