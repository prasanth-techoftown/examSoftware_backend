import { GetPaginationOptions } from '../../../constant/Result.types'
import { QuestionMappingDTO } from '../controller/QuestionMapping.DTO'
import { UpdateQuestionMappingDTO } from '../controller/UpdateQuestionMapping.DTO'
import { QuestionMappingResult } from '../types/QuestionMapping.types'

export interface QuestionMappingServiceMethods {
    getQuestionMapping(
        options: GetPaginationOptions
    ): Promise<QuestionMappingResult>
    addQuestionMapping(data: QuestionMappingDTO): Promise<QuestionMappingResult>
    updateQuestionMapping(
        data: UpdateQuestionMappingDTO
    ): Promise<QuestionMappingResult>
    getExistingCrmCourse(): Promise<QuestionMappingResult>
}
