import { ResultSetHeader } from 'mysql2'
import { GradeDTO } from '../controller/Grade.DTO'
import { UpdateGradeDTO } from '../controller/UpdateGrade.DTO'
import { GetPaginationOptions } from '../../constant/Result.types'
import { GradeInfo } from '../types/Grade.types'

export interface GradeRepositoryMethods {
    addGrade(module: GradeDTO): Promise<ResultSetHeader>
    updateGrade(updateGrade: UpdateGradeDTO): Promise<ResultSetHeader>
    getGrade(
        options: GetPaginationOptions
    ): Promise<{ grade: GradeInfo[]; total?: number }>

    checkRangeConflict(
        minMark: number,
        maxMark: number,
        excludeId?: number
    ): Promise<boolean>
}
