import { inject, injectable } from 'tsyringe'
import { AppError } from '../../../../constant/App.error'
import { ExamSessionQuestionDTO } from '../../exam-session-question/controller/ExamSessionQuestion.DTO'
import { SubmitExamSessionDTO } from '../controller/SubmitExamSession.DTO'
import { ExamSessionRepositoryMethods } from '../repository/ExamSession.repoInterface'
import {
    EligibilityReason,
    EligibilityResult,
    ResultInfo,
    ExamSessionQuestionStatus,
    ExamSessionResult,
    ExamSessionStatus,
    ExamResultStatus,
} from '../types/ExamSession.types'
import { GetPaginationOptions, Status } from '../../../../constant/Result.types'
import { ExamSessionServiceMethods } from './ExamSession.serviceInterface'
import { ExamSessionQuestionServiceMethods } from '../../exam-session-question/service/ExamSessionQuestion.serviceInterface'
import { AppDataSource } from '../../../../config/data-source'
import { ExamAnswerLogRepositoryMethods } from '../../../logs/examAnswerLogs/repository/ExamAnswerLogs.repoInterface'
import { ExamSessionDTO } from '../controller/ExamSession.DTO'
import { SchedulingRepositoryMethods } from '../../../scheduling/repository/Scheduling.repoInterface'
import { generateSnowflakeId } from '../../../../utils/snowflake'
import { CacheService } from '../../../../cache/ClearCache'
import { CACHE_TTL } from '../../../../cache/cache'
import { ExamScheduleStatus } from '../../../scheduling/types/Scheduling.types'
import { ExamLogsServiceMethods } from '../../../logs/examLogs/service/ExamLogs.serviceInterface'
import { ExamLogsDTO } from '../../../logs/examLogs/controller/ExamLogs.DTO'
import { ExamActivityAction } from '../../../logs/examLogs/types/ExamLogs.types'
@injectable()
export class ExamSessionService implements ExamSessionServiceMethods {
    constructor(
        @inject('ExamSessionRepository')
        private examSessionRepository: ExamSessionRepositoryMethods,
        @inject('ExamSessionQuestionService')
        private examSessionQuestionService: ExamSessionQuestionServiceMethods,
        @inject('ExamLogsService')
        private examLogsService: ExamLogsServiceMethods,

        @inject('ExamAnswerLogRepository')
        private examAnswerLogRepository: ExamAnswerLogRepositoryMethods,

        @inject('SchedulingRepository')
        private schedulingRepository: SchedulingRepositoryMethods,
        private clearCache: CacheService
    ) {}

    startExamForStudent = async (
        data: ExamSessionDTO,
        action: ExamActivityAction = ExamActivityAction.RE_EXAM
    ): Promise<ExamSessionResult> => {
        const queryRunner = AppDataSource.createQueryRunner()

        await queryRunner.connect()
        await queryRunner.startTransaction()

        try {
            const hasActiveSession =
                await this.examSessionRepository.checkStudentHasActiveSession(
                    data.getStudentId(),
                    queryRunner
                )
            let examSessionId: number

            if (hasActiveSession.length) {
                const oldSessionData = hasActiveSession[0]

                const oldSessionId = Number(hasActiveSession[0].examSessionId)
                const logAction =
                    oldSessionData.result === 'PASSED'
                        ? ExamActivityAction.IMPROVEMENT
                        : ExamActivityAction.RE_EXAM
                const logDTO = new ExamLogsDTO(
                    oldSessionData.studentId,
                    logAction,
                    oldSessionData.examSessionId,
                    oldSessionData.grade,
                    oldSessionData.score,
                    oldSessionData.percentage,
                    oldSessionData.result
                )

                await this.examLogsService.addExamLogs(logDTO, queryRunner)

                await this.examSessionRepository.deleteAnswerLogs(
                    oldSessionId,
                    queryRunner
                )

                await this.examSessionRepository.deleteSessionQuestionLogs(
                    oldSessionId,
                    queryRunner
                )
                await this.examSessionRepository.deleteSession(
                    oldSessionId,
                    queryRunner
                )
            }

            const id = generateSnowflakeId()

            const studentCourse =
                await this.examSessionRepository.getStudentById(
                    data.getStudentId()
                )

            if (!studentCourse || studentCourse.length === 0) {
                throw new AppError('Student course not found', 404)
            }

            const courseId = studentCourse[0].courseId
            const sessionTime =
                await this.examSessionRepository.getDurationByCourseId(courseId)

            const durationSeconds = sessionTime?.durationMinutes
                ? sessionTime.durationMinutes * 60
                : 0
            examSessionId =
                await this.examSessionRepository.startExamForStudent(
                    id,
                    data,
                    durationSeconds,
                    queryRunner
                )

            const questionRows =
                await this.examSessionRepository.getRandomQuestionsForCourse(
                    courseId
                )

            if (questionRows.length !== data.getTotalQuestion()) {
                return {
                    status: ExamSessionQuestionStatus.TOTAL_MISTAKE,
                }
            }

            const questionsDTO = questionRows.map(
                (q: { questionId: number }) =>
                    new ExamSessionQuestionDTO(
                        examSessionId,
                        q.questionId,
                        data.getCreatedBy()
                    )
            )

            if (questionsDTO.length > 0) {
                await this.examSessionQuestionService.addExamSessionQuestion(
                    questionsDTO,
                    queryRunner
                )
            }

            await queryRunner.commitTransaction()

            await this.clearCache.delByPattern('examSession:')

            return {
                status: Status.SUCCESS,
                examSessionId,
            }
        } catch (err) {
            await queryRunner.rollbackTransaction()
            console.log(err)

            if (err instanceof AppError) throw err
            throw new AppError('Failed to start exam session', 500)
        } finally {
            await queryRunner.release()
        }
    }

    // submitExamSession = async (
    //     data: SubmitExamSessionDTO
    // ): Promise<ExamSessionResult> => {
    //     const queryRunner = AppDataSource.createQueryRunner()

    //     await queryRunner.connect()

    //     try {
    //         await queryRunner.startTransaction()

    //         const scoreRow =
    //             await this.examAnswerLogRepository.getScoreByExamSessionId(
    //                 data.getexamSessionId(),
    //                 queryRunner
    //             )

    //         const score = scoreRow.correctCount
    //         const attemptedCount = scoreRow.attemptedCount

    //         const sessionRow =
    //             await this.examSessionRepository.getExamSessionById(
    //                 data.getexamSessionId(),
    //                 queryRunner
    //             )

    //         if (!sessionRow) throw new AppError('Exam session not found', 404)
    //         const percentage = sessionRow.totalQuestion
    //             ? Math.round((score / sessionRow.totalQuestion) * 100)
    //             : 0

    //         const grade = await this.examSessionRepository.getGradeByPercentage(
    //             percentage,
    //             queryRunner
    //         )

    //         let resultStatus: 'PASSED' | 'FAILED' = 'FAILED'

    //         if (grade && grade.toUpperCase() !== 'F') {
    //             resultStatus = 'PASSED'
    //         }

    //         await this.examSessionRepository.updateExamSession(
    //             data,
    //             score,
    //             attemptedCount,

    //             grade ?? 'F',
    //             resultStatus,
    //             percentage,
    //             queryRunner
    //         )

    //         await this.schedulingRepository.updateExamScheduleStatus(
    //             sessionRow.examSchedulingId,
    //             data.getUpdatedBy(),
    //             queryRunner
    //         )
    //         const getScore = await this.examSessionRepository.getScore(
    //             data.getexamSessionId(),
    //             queryRunner
    //         )

    //         await queryRunner.commitTransaction()
    //         await this.clearCache.delByPattern('examSession:')
    //         await this.clearCache.delByPattern('student:')
    //         await this.clearCache.delByPattern('fees-transaction:')

    //         const row = getScore?.[0]

    //         if (!row) {
    //             throw new AppError('Failed to fetch exam session score', 404)
    //         }

    //         return {
    //             status: Status.SUCCESS,
    //             data: {
    //                 examSessionId: Number(row.examSessionId),
    //                 score: Number(row.score),
    //                 attendedQuestions: Number(row.attendedQuestions),
    //                 totalQuestion: Number(row.totalQuestion),
    //                 firstName: row.firstName,
    //                 lastName: row.lastName,
    //                 courseName: row.courseName,
    //                 startedAt: row.startedAt,
    //                 submittedAt: row.submittedAt,
    //                 totalTime: Number(row.totalTime),
    //             },
    //         }
    //     } catch (err) {
    //         if (queryRunner.isTransactionActive) {
    //             await queryRunner.rollbackTransaction()
    //         }
    //         throw err
    //     } finally {
    //         if (!queryRunner.isReleased) {
    //             await queryRunner.release()
    //         }
    //     }
    // }
    submitExamSession = async (
        data: SubmitExamSessionDTO
    ): Promise<ExamSessionResult> => {
        const queryRunner = AppDataSource.createQueryRunner()

        await queryRunner.connect()

        try {
            await queryRunner.startTransaction()

            const scoreRow =
                await this.examAnswerLogRepository.getScoreByExamSessionId(
                    data.getexamSessionId(),
                    queryRunner
                )

            const score = scoreRow.correctCount
            const attemptedCount = scoreRow.attemptedCount

            const sessionRow =
                await this.examSessionRepository.getExamSessionById(
                    data.getexamSessionId(),
                    queryRunner
                )

            if (!sessionRow) throw new AppError('Exam session not found', 404)
            const percentage = sessionRow.totalQuestion
                ? Math.round((score / sessionRow.totalQuestion) * 100)
                : 0

            const grade = await this.examSessionRepository.getGradeByPercentage(
                percentage,
                queryRunner
            )

            let resultStatus: ExamResultStatus = ExamResultStatus.FAILED

            if (grade && grade.toUpperCase() !== 'F') {
                resultStatus = ExamResultStatus.PASSED
            }

            await this.examSessionRepository.updateExamSession(
                data,
                score,
                attemptedCount,

                grade ?? 'F',
                resultStatus,
                percentage,
                queryRunner
            )

            await this.schedulingRepository.updateExamScheduleStatus(
                sessionRow.examSchedulingId,
                data.getUpdatedBy(),
                queryRunner
            )

            const getScore = await this.examSessionRepository.getScore(
                data.getexamSessionId(),
                queryRunner
            )
            const row = getScore?.[0]

            if (!row) {
                throw new AppError('Failed to fetch exam session score', 404)
            }

            await queryRunner.commitTransaction()
            await this.clearCache.delByPattern('examSession:')
            await this.clearCache.delByPattern('student:')
            await this.clearCache.delByPattern('completed-student:')
            await this.clearCache.delByPattern('completed_crm_student:')
            await this.clearCache.delByPattern('fees-transaction:')
            await this.clearCache.delByPattern('student_password:')

            return {
                status: Status.SUCCESS,
                data: {
                    examSessionId: Number(row.examSessionId),
                    score: Number(row.score),
                    attendedQuestions: Number(row.attendedQuestions),
                    totalQuestion: Number(row.totalQuestion),
                    firstName: row.firstName,
                    lastName: row.lastName,
                    courseName: row.courseName,
                    startedAt: row.startedAt,
                    submittedAt: row.submittedAt,
                    totalTime: Number(row.totalTime),
                },
            }
        } catch (err) {
            console.log(err, 'err')

            if (queryRunner.isTransactionActive) {
                await queryRunner.rollbackTransaction()
            }
            throw err
        } finally {
            if (!queryRunner.isReleased) {
                await queryRunner.release()
            }
        }
    }

    getScore = async (examSessionId: number): Promise<ExamSessionResult> => {
        try {
            const session: ResultInfo[] =
                await this.examSessionRepository.getScore(examSessionId)

            const row = session[0] ?? []

            if (!row) return { status: Status.NO_NAME_FOUND }
            return {
                status: Status.SUCCESS,
                data: {
                    examSessionId: Number(row.examSessionId),
                    score: Number(row.score),
                    attendedQuestions: Number(row.attendedQuestions),
                    totalQuestion: Number(row.totalQuestion),
                    firstName: row.firstName,
                    lastName: row.lastName,
                    courseName: row.courseName,
                    startedAt: row.startedAt,
                    submittedAt: row.submittedAt,
                    totalTime: Number(row.totalTime),
                },
            }
        } catch (err) {
            console.log(err)
            throw new AppError('Failed to fetch score', 500)
        }
    }
    getStudentByExamStatus = async ({
        limit,
        offset,
        all,
        search,
        date,
    }: GetPaginationOptions): Promise<ExamSessionResult> => {
        try {
            const safeLimit = limit
            const safeOffset = offset
            let cacheKey = all
                ? `examSession:student:global:all`
                : `examSession:student:${safeLimit}:${safeOffset}`
            if (search) cacheKey += `examSession:student:search:${search}`
            if (date) cacheKey += `examSession:student:date:${date}`
            const cached =
                await this.clearCache.get<ExamSessionResult>(cacheKey)
            if (cached) return cached

            const data =
                await this.examSessionRepository.getStudentByExamStatus({
                    limit,
                    offset,
                    all,
                    search,
                    date,
                })

            if (!data.students.length) {
                return {
                    status: Status.NO_NAME_FOUND,
                    students: [],
                    total: 0,
                }
            }

            const student = data.students ?? []

            const total = data.total ?? data.students.length

            const response: ExamSessionResult = {
                status: Status.SUCCESS,
                students: student,
                total,
            }
            await this.clearCache.set(cacheKey, response, CACHE_TTL)
            return response
        } catch (error) {
            console.log(error, 'error')
            throw new AppError('Failed to fetch student', 500)
        }
    }
    getSessionStartAndDuration = async (
        examStudentId: number
    ): Promise<number> => {
        try {
            const session =
                await this.examSessionRepository.getSessionStartAndDuration(
                    examStudentId
                )
            if (!session) return 0
            const startedAtMs = new Date(session.startedAt).getTime()
            const durationSec = session.durationMinutes * 60
            const elapsedSec = Math.floor((Date.now() - startedAtMs) / 1000)
            const remainingSec = Math.max(durationSec - elapsedSec, 0)

            return remainingSec
        } catch (err) {
            console.log(err)
            throw new AppError('Failed to get remaining seconds', 500)
        }
    }

    checkStudentEligibility = async (
        studentId: number
    ): Promise<EligibilityResult> => {
        try {
            const row =
                await this.examSessionRepository.checkStudentEligibility(
                    studentId
                )

            if (!row) {
                return {
                    eligible: false,
                    reason: EligibilityReason.NO_SCHEDULE,
                    message: 'No exam scheduled for you today.',
                }
            }
            const firstName = row.firstName ?? ''
            const lastName = row.lastName ?? ''
            const courseName = row.courseName ?? ''
            const studentName = `${firstName} ${lastName}`.trim()
            const remainingSeconds = row.remainingSeconds
            const scheduleStatus = row.scheduleStatus ?? ''
            const sessionStatus = row.sessionStatus ?? null
            const sessionId = row.sessionId ?? null

            const score = Number(row.score ?? 0)
            const totalQuestion = Number(row.totalQuestion ?? 0)
            const attendedQuestions = Number(row.attendedQuestions ?? 0)
            const submittedAt = row.submittedAt ?? ''

            if (scheduleStatus === 'CANCELLED') {
                return {
                    eligible: false,
                    reason: EligibilityReason.SCHEDULE_CANCELLED,
                    message: 'Your exam schedule status is cancelled.',
                }
            }

            if (scheduleStatus === ExamScheduleStatus.ABSENT) {
                return {
                    eligible: false,
                    reason: EligibilityReason.SCHEDULE_ABSENT,
                    message: 'You were marked absent for this exam.',
                }
            }

            if (
                sessionId &&
                sessionStatus &&
                [
                    ExamSessionStatus.SUBMITTED,
                    ExamSessionStatus.TIMED_OUT,
                ].includes(sessionStatus)
            ) {
                const percentage =
                    totalQuestion > 0
                        ? Math.round((score / totalQuestion) * 100)
                        : 0

                return {
                    eligible: false,
                    reason: EligibilityReason.ALREADY_COMPLETED,
                    message: 'You have already submitted this exam.',
                    result: {
                        sessionId: Number(sessionId),
                        submittedAt,
                        score,
                        totalQuestion,
                        attendedQuestions,
                        percentage,
                    },
                }
            }

            if (sessionId && sessionStatus === ExamSessionStatus.SUSPENDED) {
                const canResume =
                    remainingSeconds !== null && remainingSeconds !== undefined

                if (canResume) {
                    return {
                        eligible: true,
                        reason: EligibilityReason.RESUME,
                        message: 'Resuming suspended session.',
                        sessionId: Number(sessionId),
                        scheduleId: Number(row.scheduleId),
                        studentName,
                        courseName,
                    }
                }

                return {
                    eligible: false,
                    reason: EligibilityReason.SUSPENDED,
                    message:
                        'Your exam session was suspended. Please contact admin.',
                }
            }

            if (sessionId && sessionStatus === ExamSessionStatus.IN_PROGRESS) {
                const canResume =
                    remainingSeconds !== null && remainingSeconds !== undefined

                if (!canResume) {
                    return {
                        eligible: true,
                        reason: EligibilityReason.START,
                        message: 'Session corrupted. Restarting exam.',
                        scheduleId: Number(row.scheduleId),
                        studentName,
                        courseName,
                    }
                }

                return {
                    eligible: true,
                    reason: EligibilityReason.RESUME,
                    message: 'You have an in-progress exam. Resuming.',
                    sessionId: Number(sessionId),
                    scheduleId: Number(row.scheduleId),
                    studentName,
                    courseName,
                }
            }

            return {
                eligible: true,
                reason: EligibilityReason.START,
                message: 'You are eligible to start the exam.',
                scheduleId: Number(row.scheduleId),
                studentName,
                courseName,
            }
        } catch (err) {
            console.log(err)
            throw new AppError('Failed to check exam eligibility', 500)
        }
    }

    updateStudentExamStatus = async (
        sessionId: number,
        status: ExamSessionStatus
    ): Promise<{ success: boolean; message: string }> => {
        try {
            const existingSession =
                await this.examSessionRepository.getExistingSession(sessionId)

            if (!existingSession.length) {
                return {
                    success: false,
                    message: 'Session not found',
                }
            }

            const sessionData = existingSession[0]

            const session =
                await this.examSessionRepository.updateStudentExamStatus(
                    sessionId,
                    status
                )

            if (session.affectedRows === 1) {
                if (status === ExamSessionStatus.SUSPENDED) {
                    const logDTO = new ExamLogsDTO(
                        sessionData.studentId,
                        ExamActivityAction.SUSPENDED,

                        sessionId
                    )

                    await this.examLogsService.addExamLogs(logDTO)
                }

                return {
                    success: true,
                    message: 'Session Status Updated',
                }
            }

            return {
                success: false,
                message: 'Session not found or not updated',
            }
        } catch (err) {
            console.log(err)
            throw new AppError('Failed to update status', 500)
        }
    }

    getSuspendedStudents = async ({
        all,
        limit,
        offset,
        search,
    }: GetPaginationOptions): Promise<ExamSessionResult> => {
        try {
            const { students, total } =
                await this.examSessionRepository.getSuspendedStudents({
                    all,
                    limit,
                    offset,
                    search,
                })
            return {
                status: students.length ? Status.SUCCESS : Status.NO_NAME_FOUND,
                students,
                total,
            }
        } catch (err) {
            console.log(err)
            throw new AppError('Failed to fetch suspended students', 500)
        }
    }
    allowReAttempt = async (
        sessionId: number
    ): Promise<{ success: boolean; message: string }> => {
        try {
            const result =
                await this.examSessionRepository.allowReAttempt(sessionId)

            await this.clearCache.delByPattern('examSession')
            if (result.affectedRows === 1) {
                return {
                    success: true,
                    message: 'Student can now re-attempt the exam',
                }
            }

            return {
                success: false,
                message: 'Session not found or already active',
            }
        } catch (err) {
            console.log(err)
            throw new AppError('Failed to allow re-attempt', 500)
        }
    }
    allowResetSession = async (
        sessionId: number
    ): Promise<{ success: boolean; message: string }> => {
        try {
            const rows =
                await this.examSessionRepository.getExistingSession(sessionId)
            if (!rows.length) {
                return { success: false, message: 'Session not found' }
            }

            const { studentId, examSchedulingId, totalQuestion, createdBy } =
                rows[0]

            const dto = new ExamSessionDTO(
                ExamSessionStatus.IN_PROGRESS,
                studentId,
                examSchedulingId,
                totalQuestion,
                createdBy,
                new Date().toISOString()
            )
            const result = await this.startExamForStudent(
                dto,
                ExamActivityAction.RESET
            )

            if (result.status !== Status.SUCCESS) {
                return { success: false, message: 'Failed to reset session' }
            }

            await this.clearCache.delByPattern('examSession')

            return {
                success: true,
                message: 'Session reset with new questions',
            }
        } catch (err) {
            console.log(err)
            throw new AppError('Failed to reset session', 500)
        }
    }
}
