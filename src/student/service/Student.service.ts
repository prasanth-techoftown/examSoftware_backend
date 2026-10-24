import { inject, injectable } from 'tsyringe'
import { CacheService } from '../../cache/ClearCache'
import { CommonRepository } from '../../common/repo/common.repo'
import { AppError } from '../../constant/App.error'
import { CACHE_KEYS, CACHE_TTL } from '../../cache/cache'
import { GetPaginationOptions, Status } from '../../constant/Result.types'
import { StudentServiceMethods } from './Student.serviceInterface'
import { StudentRepositoryMethods } from '../repository/Student.repoInterface'
import { StudentDTO } from '../controller/Student.DTO'
import { StudentResult } from '../types/Student.types'
import { UpdateStudentDTO } from '../controller/UpdateStudent.DTO'
import { SchedulingRepositoryMethods } from '../../exam-mgt/scheduling/repository/Scheduling.repoInterface'
import { AppDataSource } from '../../config/data-source'
import { StudentLoginRepositoryMethods } from '../../security/studentLogin/repository/StudentLogin.repoInterface'
import { StudentLoginDTO } from '../../security/studentLogin/controller/StudentLogin.DTO'
import { RandomPassword } from '../../utils/RandomPassword'
@injectable()
export class StudentService implements StudentServiceMethods {
    constructor(
        @inject('StudentRepository')
        private studentRepository: StudentRepositoryMethods,
        @inject('CommonRepository')
        private commonRepository: CommonRepository,
        @inject('SchedulingRepository')
        private schedulingRepository: SchedulingRepositoryMethods,

        @inject('StudentLoginService')
        private studentLoginService: StudentLoginRepositoryMethods,

        private readonly clearCache: CacheService
    ) {}

    addStudent = async (data: StudentDTO): Promise<StudentResult> => {
      
        const duplicateStudent = await this.commonRepository.existsActiveRecord(
            'sem_student',
            {
                firstName: data.getFirstName(),
                lastName: data.getLastName(),

                phoneNumber: data.getPhoneNumber(),
                courseId: data.getCourseId(),
            }
        )

        if (duplicateStudent) {
          
            return { status: Status.NAME_ALREADY_EXIST }
        }

        try {
            await this.studentRepository.addStudent(
                data,
               
            )

      
           
            await this.clearCache.delByPattern('student:')
            await this.clearCache.delByPattern('student_password:')
            return {
                status: Status.SUCCESS,
            }
        } catch (err) {
          
            console.log(err, 'err')
            if (err instanceof AppError) throw err
            throw new AppError('Failed to add student', 500)
        } 
    }
getAllStudent = async ({
    limit,
    offset,
    all,
    search,
}: GetPaginationOptions): Promise<StudentResult> => {
    try {
        const cacheKey = CACHE_KEYS.STUDENT_LIST({
            limit,
            offset,
            all,
            search,
        })

        const cached =
            await this.clearCache.get<StudentResult>(cacheKey)

        if (cached) {
            return cached
        }

        const data = await this.studentRepository.getAllStudent({
            limit,
            offset,
            all,
            search,
        })

        const response: StudentResult = {
            status: data.student.length
                ? Status.SUCCESS
                : Status.NO_NAME_FOUND,
            student: data.student,
            total: data.total,
        }

        // Cache the complete response, not just the student array.
        await this.clearCache.set(cacheKey, response, CACHE_TTL)

        return response
    } catch (error) {
        console.log(error, 'error')

        throw new AppError('Failed to fetch student', 500)
    }
}
    updateStudent = async (data: UpdateStudentDTO): Promise<StudentResult> => {
        try {
            const existingStudent =
                await this.commonRepository.existsActiveRecord('sem_student', {
                    id: data.getId(),
                })

            if (!existingStudent) {
                return { status: Status.NAME_NOT_EXIST }
            }

            const duplicateStudent =
                await this.commonRepository.findActiveRecord('sem_student', {
                    firstName: data.getFirstName(),
                    lastName: data.getLastName(),
                    phoneNumber: data.getPhoneNumber(),
                    courseId: data.getCourseId(),
                    id: Number(data.getId()),
                })

            if (duplicateStudent !== null) {
                return { status: Status.NAME_ALREADY_EXIST }
            }

            await this.studentRepository.updateStudent(data)

            await this.clearCache.delByPattern('student:')

            return { status: Status.SUCCESS } as StudentResult
        } catch (err) {
            console.log(err)
            if (err instanceof AppError) throw err
            throw new AppError('Failed to update student', 500)
        }
    }
    // validateCourseQuestions = async (
    //     courseIds: number[]
    // ): Promise<{
    //     valid: number[]
    //     invalid: number[]
    // }> => {
    //     if (!courseIds.length) {
    //         return { valid: [], invalid: [] }
    //     }

    //     const mappings =
    //         await this.schedulingRepository.getMappingsByCrmCourseIds(courseIds)

    //     if (!mappings.length) {
    //         return { valid: [], invalid: courseIds }
    //     }

    //     const questionCourseIds = mappings.map((m) => m.questionCourseId)

    //     const questionCounts =
    //         await this.schedulingRepository.getQuestionCountsByCourseIds(
    //             questionCourseIds
    //         )

    //     const questionCountMap = new Map(
    //         questionCounts.map((q) => [q.courseId, Number(q.count)])
    //     )

    //     const valid: number[] = []
    //     const invalid: number[] = []

    //     for (const map of mappings) {
    //         const actualCount = questionCountMap.get(map.questionCourseId) || 0

    //         const expectedCount = map.subjectTotalQuestion

    //         if (actualCount >= expectedCount) {
    //             valid.push(map.crmCourseId)
    //         } else {
    //             invalid.push(map.crmCourseId)
    //         }
    //     }

    //     const mappedCrmIds = new Set(mappings.map((m) => m.crmCourseId))

    //     for (const id of courseIds) {
    //         if (!mappedCrmIds.has(id)) {
    //             invalid.push(id)
    //         }
    //     }

    //     return { valid, invalid }
    // }
    getStudentById = async (id: number): Promise<StudentResult> => {
        try {
            const cacheKey = `student:${id}`

            const cached = await this.clearCache.get<StudentResult>(cacheKey)
            if (cached) return cached

            const student = await this.studentRepository.getStudentById(id)

            if (!student) {
                return {
                    status: Status.NAME_NOT_EXIST,
                }
            }

            const response: StudentResult = {
                status: Status.SUCCESS,
                student: [student],
            }

            await this.clearCache.set(cacheKey, response, CACHE_TTL)

            return response
        } catch (err) {
            console.log(err)
            throw new AppError('Failed to fetch student', 500)
        }
    }
}
