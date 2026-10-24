import { GetPaginationOptions } from '../../constant/Result.types'
import { GradeDTO } from '../controller/Grade.DTO'
import { UpdateGradeDTO } from '../controller/UpdateGrade.DTO'
import { GradeResult } from '../types/Grade.types'

export interface GradeServiceMethods {
    addGrade(module: GradeDTO): Promise<GradeResult>
    updateGrade(updateGrade: UpdateGradeDTO): Promise<GradeResult>
    getGrade(options: GetPaginationOptions): Promise<GradeResult>
}
