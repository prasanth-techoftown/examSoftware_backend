import { injectable, inject } from 'tsyringe'
import { GradeDTO } from '../controller/Grade.DTO'
import { GradeServiceMethods } from './Grade.serviceInterface'
import { CommonRepository } from '../../common/repo/common.repo'
import { UpdateGradeDTO } from '../controller/UpdateGrade.DTO'
import { AppError } from '../../constant/App.error'
import { GetPaginationOptions, Status } from '../../constant/Result.types'
import { CacheService } from '../../cache/ClearCache'
import { CACHE_KEYS, CACHE_TTL } from '../../cache/cache'
import { GradeRepositoryMethods } from '../repository/Grade.repoInterface'
import { GradeResult, GradeStatus } from '../types/Grade.types'

@injectable()
export class GradeService implements GradeServiceMethods {
    constructor(
        @inject('GradeRepository')
        private GradeRepository: GradeRepositoryMethods,
        @inject('CommonRepository') private commonRepository: CommonRepository,
        private clearCache: CacheService
    ) {}

    addGrade = async (grade: GradeDTO): Promise<GradeResult> => {
        try {
            const minRange = Number(grade.getMinRange())
            const maxRange = Number(grade.getMaxRange())

            if (maxRange < minRange) {
                return { status: GradeStatus.INVALID_RANGE }
            }
            const existingGrade =
                await this.commonRepository.existsActiveRecord('sem_grade', {
                    grade: grade.getGrade(),
                })

            if (existingGrade) {
                return { status: Status.NAME_ALREADY_EXIST }
            }
            const checkRange = await this.GradeRepository.checkRangeConflict(
                grade.getMinRange(),
                grade.getMaxRange()
            )

            if (checkRange) return { status: GradeStatus.RANGE_ALREADY_EXIST }
            await this.GradeRepository.addGrade(grade)
            await this.clearCache.delByPattern('grade:')

            return { status: Status.SUCCESS }
        } catch (err) {
            if (err instanceof AppError) throw err
            throw new AppError('Failed to add grade', 500)
        }
    }

    updateGrade = async (updateGrade: UpdateGradeDTO): Promise<GradeResult> => {
        try {
            const minRange = Number(updateGrade.getMinRange())
            const maxRange = Number(updateGrade.getMaxRange())

            if (maxRange < minRange) {
                return { status: GradeStatus.INVALID_RANGE }
            }
            const existingGrade =
                await this.commonRepository.existsActiveRecord('sem_grade', {
                    id: updateGrade.getId(),
                })
            if (!existingGrade) {
                return { status: Status.NAME_NOT_EXIST }
            }
            const checkRange = await this.GradeRepository.checkRangeConflict(
                updateGrade.getMinRange(),
                updateGrade.getMaxRange(),
                updateGrade.getId()
            )

            if (checkRange) return { status: GradeStatus.RANGE_ALREADY_EXIST }
            const duplicateGrade = await this.commonRepository.findActiveRecord(
                'sem_grade',
                { grade: updateGrade.getGrade(), id: updateGrade.getId() }
            )
            if (duplicateGrade !== null) {
                return { status: Status.NAME_ALREADY_EXIST }
            }

            await this.GradeRepository.updateGrade(updateGrade)
            await this.clearCache.delByPattern('grade:')

            return { status: Status.SUCCESS }
        } catch (err) {
            if (err instanceof AppError) throw err
            throw new AppError('Failed to update grade', 500)
        }
    }

    getGrade = async ({
        limit,
        offset,
        all,
    }: GetPaginationOptions): Promise<GradeResult> => {
        try {
            let cacheKey = all
                ? CACHE_KEYS.MODULE_ALL
                : `grade:global:${limit}:${offset}`

            const cached = await this.clearCache.get<GradeResult>(cacheKey)
            if (cached) return cached
            const data = await this.GradeRepository.getGrade({
                limit,
                offset,
                all,
            })

            if (!data.grade.length) {
                return {
                    status: Status.NO_NAME_FOUND,
                    grade: [],
                    total: 0,
                }
            }

            const grade = data.grade ?? []

            const total = data.total ?? data.grade.length

            const response: GradeResult = {
                status: Status.SUCCESS,
                grade: grade,
                total,
            }
            await this.clearCache.set(cacheKey, response, CACHE_TTL)
            return response
        } catch (err) {
            console.log(err, 'Failed to fetch Grades')

            throw new AppError('Failed to fetch grades', 500)
        }
    }
}
