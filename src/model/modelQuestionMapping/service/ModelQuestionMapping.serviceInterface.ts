import { GetPaginationOptions } from '../../../constant/Result.types'
import { ModelQuestionMappingDTO } from '../controller/ModelQuestionMapping.DTO'
import { UpdateModelQuestionMappingDTO } from '../controller/UpdateModelQuestionMapping.DTO'
import { ModelQuestionMappingResult } from '../types/ModelQuestionMapping.types'

export interface ModelQuestionMappingServiceMethods {
    getModelQuestionMapping(
        options: GetPaginationOptions
    ): Promise<ModelQuestionMappingResult>
    addModelQuestionMapping(
        data: ModelQuestionMappingDTO
    ): Promise<ModelQuestionMappingResult>
    updateModelQuestionMapping(
        data: UpdateModelQuestionMappingDTO
    ): Promise<ModelQuestionMappingResult>
}
