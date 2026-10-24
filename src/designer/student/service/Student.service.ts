import { inject, injectable } from 'tsyringe'

import { StudentRepositoryMethods } from '../repository/Student.repoInterface'

import { StudentResult } from '../types/Student.types'
import { StudentServiceMethods } from './Student.serviceInterface'
import { CacheService } from '../../../cache/ClearCache'
import { GetPaginationOptions, Status } from '../../../constant/Result.types'
import { CACHE_KEYS, CACHE_TTL } from '../../../cache/cache'
import { AppError } from '../../../constant/App.error'

@injectable()
export class StudentServiceForDesigner implements StudentServiceMethods {
    constructor(
        @inject('StudentRepositoryForDesigner')
        private studentRepository: StudentRepositoryMethods,

        private readonly clearCache: CacheService
    ) {}

    getStudentForDesigner = async (
        { limit, offset, all, search }: GetPaginationOptions,
        perBranchLimit: number
    ): Promise<StudentResult> => {
        try {
            const cacheKey = CACHE_KEYS.DESIGNER_STUDENT_LIST({
                limit,
                offset,
                all,
                search,
                perBranchLimit,
            })

            const cached = await this.clearCache.get<StudentResult>(cacheKey)

            if (cached) return cached

            const data = await this.studentRepository.getStudentForDesigner(
                {
                    limit,
                    offset,
                    all,
                    search,
                },
                perBranchLimit
            )

            if (!data.student.length) {
                return {
                    status: Status.NO_NAME_FOUND,
                    student: [],
                    total: 0,
                }
            }

            const response: StudentResult = {
                status: Status.SUCCESS,
                student: data.student,
                total: data.total ?? data.student.length,
            }
            await this.clearCache.set(cacheKey, response, CACHE_TTL)

            return response
        } catch (error) {
            console.log(error, 'error')
            throw new AppError('Failed to fetch student', 500)
        }
    }
    getStudentsForBranch = async (
        branchId: string,
        options: { limit?: number; offset?: number; search?: string }
    ): Promise<StudentResult> => {
        try {
            const cacheKey = CACHE_KEYS.DESIGNER_STUDENT_LIST_BRANCH({
                limit: options.limit,
                offset: options.offset,
                search: options.search,
                branchId,
            })

            const cached = await this.clearCache.get<StudentResult>(cacheKey)

            if (cached) return cached
            const data = await this.studentRepository.getStudentsForBranch(
                branchId,
                options
            )

            if (!data.students.length) {
                return {
                    status: Status.NO_NAME_FOUND,
                    student: [],
                    total: 0,
                }
            }
            const response: StudentResult = {
                status: Status.SUCCESS,
                students: data.students,
                total: data.total ?? data.students.length,
            }
            await this.clearCache.set(cacheKey, response, CACHE_TTL)
            return response
        } catch (error) {
            throw new AppError('Failed to fetch branch students', 500)
        }
    }
}
