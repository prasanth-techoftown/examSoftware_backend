import { inject, injectable } from 'tsyringe'
import { AppError } from '../../../constant/App.error'
import { StudentLoginServiceMethods } from './StudentLogin.serviceInterface'
import { StudentLoginRepositoryMethods } from '../repository/StudentLogin.repoInterface'
import {
    StudentLoginResult,
    StudentLoginStatus,
} from '../types/StudentLogin.types'
import { StudentLoginDTO } from '../controller/StudentLogin.DTO'
import { CacheService } from '../../../cache/ClearCache'
import { Status } from '../../../constant/Result.types'
import { QueryRunner } from 'typeorm'
import { formatDateLocal } from '../../../utils/FormattingDate'

@injectable()
export class StudentLoginService implements StudentLoginServiceMethods {
    constructor(
        @inject('StudentLoginRepository')
        private studentLoginRepository: StudentLoginRepositoryMethods,
        private clearCache: CacheService
    ) {}
    addStudentForLogin = async (
        data: StudentLoginDTO,
        queryRunner: QueryRunner
    ): Promise<StudentLoginResult> => {
        try {
            await this.studentLoginRepository.addStudentForLogin(
                data,
                queryRunner
            )

            await this.clearCache.delByPattern('scheduling:')

            return { status: Status.SUCCESS }
        } catch (err) {
            console.log(err, 'err')
            if (err instanceof AppError) throw err
            throw new AppError('Failed to add Student', 500)
        }
    }

    studentLoginService = async (
        admissionNumber: string,
        password: string
    ): Promise<any> => {
        try {
            const result =
                await this.studentLoginRepository.studentLoginRepository(
                    admissionNumber
                )
            // console.log(result, 'RESULT')
            if (!result || result.length === 0) {
                return { status: StudentLoginStatus.USER_NOT_FOUND }
            }

            const user = result[0]

            if (password !== user.password) {
                return { status: StudentLoginStatus.WRONG_PASSWORD }
            }

            const schedule =
                await this.studentLoginRepository.getTodayScheduleByStudentId(
                    user.studentId
                )

            if (!schedule || schedule.length === 0) {
                return { status: StudentLoginStatus.NOT_SCHEDULED_TODAY }
            }
            const current = schedule[0]

            if (
                current.status === 'COMPLETED' &&
                current.exam_session_status === 'SUBMITTED'
            ) {
                return { status: StudentLoginStatus.EXAM_ALREADY_COMPLETED }
            }

            if (current.exam_session_status === 'SUSPENDED') {
                return { status: StudentLoginStatus.EXAM_SUSPENDED }
            }

            const examDateStr = formatDateLocal(current.examDate)
            const todayStr = formatDateLocal(new Date())

            if (examDateStr !== todayStr) {
                return {
                    status: StudentLoginStatus.NOT_SCHEDULED_TODAY,
                    message: `Your exam is scheduled on ${examDateStr}`,
                }
            }

            if (examDateStr !== todayStr) {
                return {
                    status: StudentLoginStatus.NOT_SCHEDULED_TODAY,
                    message: `Your exam is scheduled on ${examDateStr}`,
                }
            }
            const { password: _, ...userWithoutPassword } = user
            return {
                status: Status.SUCCESS,
                studentLogin: userWithoutPassword,
            }
        } catch (err) {
            console.log(err, 'ser')

            if (err instanceof AppError) throw err
            throw new AppError('Failed to StudentLogin', 500)
        }
    }

    updateStudentPassword = async (
        studentId: number,
        password: string,
        queryRunner: QueryRunner
    ): Promise<void> => {
        try {
            await this.studentLoginRepository.updateStudentPassword(
                studentId,
                password,
                queryRunner
            )
        } catch (err) {
            if (err instanceof AppError) throw err
            throw new AppError('Failed to Update Password', 500)
        }
    }

    // studentLoginServiceForMobile = async (admissionNumber: string, password: string) => {
    //     try {

    //         const result = await this.studentLoginRepository.studentLoginRepository(
    //             admissionNumber.toLowerCase()
    //         )

    //         if (!result || result.length === 0) {
    //             return { status: StudentLoginStatus.USER_NOT_FOUND }
    //         }

    //         const user = result[0]

    //         const isPasswordMatch = await bcrypt.compare(
    //             password,
    //             user.password
    //         )
    //         console.log(isPasswordMatch)
    //         if (!isPasswordMatch) {
    //             return { status: StudentLoginStatus.WRONG_PASSWORD }
    //         }
    //         const { password: _, ...userWithoutPassword } = user
    //         console.log(user)
    //         return {
    //             status: StudentLoginStatus.SUCCESS,
    //             data: {
    //                 ...userWithoutPassword,
    //             } as StudentLoginInfo,
    //         }
    //     } catch (err) {
    //         console.error('Error in studentLoginServiceForMobile:', err)

    //         if (err instanceof AppError) throw err
    //         throw new AppError(
    //             'An unexpected error occurred during mobile studentLogin',
    //             500
    //         )
    //     }
    // }
}
