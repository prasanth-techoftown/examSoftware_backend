import { injectable, inject } from 'tsyringe'
import { ExamReadyServiceMethods } from './ExamReady.serviceInterface'
import { ExamReadyRepoMethods } from '../repository/ExamReady.repoInterface'
import { CacheService } from '../../../../cache/ClearCache'
import { AppError } from '../../../../constant/App.error'
import { Status } from '../../../../constant/Result.types'
import { CACHE_TTL } from '../../../../cache/cache'
import { ExamReadyResponse } from '../types/ExamREady.types'

@injectable()
export class ExamReadyService implements ExamReadyServiceMethods {
    constructor(
        @inject('ExamReadyRepository')
        private examReadyRepository: ExamReadyRepoMethods,

        private clearCache: CacheService
    ) {}

    getExamReadyDetails = async (
        studentId: number
    ): Promise<{
        status: Status
        data: ExamReadyResponse
    }> => {
        try {
            const cacheKey = `examReady:${studentId}`

            // const cached = await this.clearCache.get(cacheKey)
            // if (cached) return cached

            const row =
                await this.examReadyRepository.getExamReadyDetails(studentId)
            if (!row) {
                throw new AppError('No exam scheduled for today', 404)
            }
            const examIsToday =
                new Date(row.examDate).toDateString() ===
                new Date().toDateString()
            const response = {
                status: Status.SUCCESS,
                data: {
                    student: {
                        id: row.id,
                        firstName: row.firstName,
                        lastName: row.lastName,
                        admissionNumber: row.admissionNumber,
                        courseName: row.courseName,
                        courseId: row.courseId,
                        academicYear: row.academicYear,
                        email: row.email,
                        phoneNumber: row.phoneNumber,
                        gender: row.gender,
                        branchName: row.branchName,
                    },
                    exam: {
                        scheduleId: row.scheduleId,
                        examDate: row.examDate,
                        scheduleStatus: row.scheduleStatus,
                        totalQuestions: row.totalQuestions,
                        durationMinutes: row.durationMinutes,
                        isToday: examIsToday,
                    },
                },
            }
            await this.clearCache.set(cacheKey, response, CACHE_TTL)
            return response
        } catch (err) {
            console.log(err)
            if (err instanceof AppError) throw err
            throw new AppError('Failed to fetch exam ready details', 500)
        }
    }
}
