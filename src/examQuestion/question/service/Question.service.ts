import { inject, injectable } from 'tsyringe'

import { QuestionServiceMethods } from './Question.serviceInterface'
import { AppError } from '../../../constant/App.error'

import { OptionService } from '../../option/service/Option.service'
import { QuestionDTO } from '../controller/Question.DTO'
import { QuestionRepositoryMethods } from '../repository/Question.repoInterface'
import { AppDataSource } from '../../../config/data-source'
import { UpdateQuestionDTO } from '../controller/UpdateQuestion.DTO'
import { CacheService } from '../../../cache/ClearCache'
import { normalize } from '../../../utils/QuestionNormalize'
import { CACHE_KEYS, CACHE_TTL } from '../../../cache/cache'
import { questionData, QuestionResult } from '../types/Question.types'
import { GetPaginationOptions, Status } from '../../../constant/Result.types'
import { QueryRunner } from 'typeorm'

@injectable()
export class QuestionService implements QuestionServiceMethods {
    constructor(
        @inject('QuestionRepository')
        private QuestionRepository: QuestionRepositoryMethods,

        private clearCache: CacheService
    ) {}

    addQuestion = async (
        question: QuestionDTO
        // courseData: StudentCourseDTO
    ): Promise<QuestionResult> => {
        const queryRunner = AppDataSource.createQueryRunner()
        await queryRunner.connect()
        await queryRunner.startTransaction()

        try {
            // const courseName = courseData.getName()
            // const existingCourse =
            //     await this.QuestionRepository.getCourseByName(courseName)

            // let finalCourseId: number
            // if (existingCourse !== null) {
            //     finalCourseId = existingCourse.id
            // } else {
            //     const courseResult =
            //         await this.courseService.addCourse(courseData)

            //     if (!courseResult.courseId) {
            //         throw new AppError('Course creation failed')
            //     }

            //     finalCourseId = courseResult.courseId
            // }
            const createdBy = question.getCreatedBy()
            const inputMode = question.getInputMode()
            const questions = question.getQuestion()

            const existingQuestions =
                await this.QuestionRepository.getQuestionByCourseId(
                    question.getCourseId()
                )

            const existingSet = new Set(
                existingQuestions.map((q) => normalize(q.question))
            )

            const duplicateQuestions: string[] = []
            const validQuestions: questionData[] = []

            for (const q of questions) {
                if (!q.question || typeof q.question !== 'string') {
                    throw new AppError('Question text is missing or invalid')
                }

                const normalized = normalize(q.question)

                if (existingSet.has(normalized)) {
                    duplicateQuestions.push(q.question)
                } else {
                    validQuestions.push(q)
                }
            }

            for (const q of validQuestions) {
                const optionSet = new Set<string>()
                let answerCount = 0

                for (const opt of q.options) {
                    if (!opt.optionName || typeof opt.optionName !== 'string') {
                        throw new AppError(
                            `Option text is missing or invalid ${q.question}`
                        )
                    }

                    const name = opt.optionName.trim().toLowerCase()
                    if (optionSet.has(name)) {
                        throw new AppError(
                            `Duplicate option found!
                                 Question: "${q.question}"
                                Duplicate Option: "${opt.optionName}"`
                        )
                    }
                    optionSet.add(name)
                    if (opt.isAnswer) answerCount++
                }

                if (answerCount !== 1) {
                    throw new AppError(
                        `Each question must have exactly one answer ${q.question},
        ${answerCount}`
                    )
                }

                const result = await this.QuestionRepository.addQuestion(
                    {
                        inputMode,
                        question: q.question.trim(),
                        courseId: question.getCourseId(),
                        createdBy,
                    },
                    queryRunner
                )

                for (const opt of q.options) {
                    await OptionService.addOptions(
                        {
                            ...opt,
                            questionId: result.insertId,
                            createdBy,
                        },
                        queryRunner
                    )
                }
            }

            await queryRunner.commitTransaction()
            await this.clearCache.delByPattern('question:')

            if (duplicateQuestions.length) {
                return {
                    status: Status.NAME_ALREADY_EXIST,
                    question: duplicateQuestions,
                }
            }

            return {
                status: Status.SUCCESS,
                question: validQuestions,
            }
        } catch (err) {
            console.log(err, 'err')

            await queryRunner.rollbackTransaction()
            throw err
        } finally {
            await queryRunner.release()
        }
    }
    getAllQuestion = async (
        { limit, offset, all }: GetPaginationOptions,
        courseId: number
    ): Promise<QuestionResult> => {
        try {
            let cacheKey: string

            if (all) {
                cacheKey = `${CACHE_KEYS.QUESTION_ALL}:all`
            } else {
                cacheKey = `question:list:limit:${limit}:offset:${offset}:courseId:${courseId}`
            }

            const cached = await this.clearCache.get<QuestionResult>(cacheKey)
            if (cached) return cached

            const data = await this.QuestionRepository.getAllQuestion(
                {
                    limit,
                    offset,
                    all,
                },
                courseId
            )

            const Questions = data.question ?? []
            const total = data.total ?? Questions.length

            const response: QuestionResult = {
                status: Status.SUCCESS,
                question: Questions,
                total,
            }

            await this.clearCache.set(cacheKey, response, CACHE_TTL)

            return response
        } catch (err) {
            console.log(err)

            if (err instanceof AppError) throw err
            throw new AppError('Failed to get Questions', 500)
        }
    }

    updateQuestion = async (
        question: UpdateQuestionDTO
    ): Promise<QuestionResult> => {
        const queryRunner = AppDataSource.createQueryRunner()
        await queryRunner.connect()
        await queryRunner.startTransaction()

        try {
            const id = question.getId()
            const questionText = question.getQuestion()
            const options = question.getOptions()
            const courseId = question.getCourseId()
            const updatedBy = question.getUpdatedBy()

            if (questionText) {
                const existingQuestion =
                    await this.QuestionRepository.getQuestionById(id)
                if (!existingQuestion) {
                    throw new AppError(`Question with ID ${id} not found`)
                }

                const existingQuestions =
                    await this.QuestionRepository.getQuestionByCourseId(
                        courseId
                    )

                const existingSet = new Set(
                    existingQuestions
                        .filter((q) => q.id !== id)
                        .map((q) => q.question)
                )

                const normalizedQuestion = questionText.trim().toLowerCase()

                if (existingSet.has(normalizedQuestion)) {
                    return { status: Status.NAME_ALREADY_EXIST }
                }

                await this.QuestionRepository.updateQuestion(
                    {
                        id,
                        question: questionText,
                        updatedBy,
                    },
                    queryRunner
                )
            }

            if (options?.length) {
                for (const opt of options) {
                    await OptionService.updateOptions(
                        {
                            ...opt,
                            questionId: id,
                            updatedBy,
                        },
                        queryRunner
                    )
                }
            }

            await queryRunner.commitTransaction()
            await queryRunner.release()

            await this.clearCache.delByPattern('question:')

            return {
                status: Status.SUCCESS,
            }
        } catch (err) {
            await queryRunner.rollbackTransaction()
            await queryRunner.release()
            console.error(err)
            throw new AppError('Failed to update Question', 500)
        }
    }

    deleteQuestion = async (
        id: number,
        deletedBy: string
    ): Promise<QuestionResult> => {
        const queryRunner = AppDataSource.createQueryRunner()
        await queryRunner.connect()
        await queryRunner.startTransaction()

        try {
            await this.QuestionRepository.deleteQuestion(
                id,
                deletedBy,
                queryRunner
            )
            await OptionService.deleteOptions(id, deletedBy, queryRunner)

            await queryRunner.commitTransaction()

            await this.clearCache.delByPattern('question:')

            return {
                status: Status.SUCCESS,
            }
        } catch (err) {
            await queryRunner.rollbackTransaction()
            console.error(err)

            if (err instanceof AppError) throw err
            throw new AppError('Failed to delete Question', 500)
        } finally {
            await queryRunner.release()
        }
    }

    getQuestionByAnswer = async (
        questionId: number,
        queryRunner: QueryRunner
    ): Promise<{ optionId: number }[]> => {
        try {
            const result = await this.QuestionRepository.getQuestionByAnswer(
                questionId,
                queryRunner
            )

            return result
        } catch (err) {
            console.log(err)

            if (err instanceof AppError) throw err
            throw new AppError('Failed to get Questions with answers', 500)
        }
    }
}
