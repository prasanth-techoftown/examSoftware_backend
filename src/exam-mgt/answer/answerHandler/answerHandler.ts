// import { Socket } from 'socket.io'
// import { container } from 'tsyringe'
// import { ExamAnswerLogService } from '../../logs/examAnswerLogs/service/ExamAnswerLogs.service'
// import { AppDataSource } from '../../../config/data-source'
// import { ExamAnswerLogDTO } from '../../logs/examAnswerLogs/controller/ExamAnswerLogs.DTO'
// import { ExamSessionService } from '../../session/examSession/service/ExamSession.service'
// import { StudentService } from '../../../student/service/Student.service'
// import { getIO } from '../../../socketServer'
// import { ExamSessionStatus } from '../../session/examSession/types/ExamSession.types'

// interface ExamContext {
//     sessionId: string
//     userId: string
//     userType: string
// }

// interface JoinPayload {
//     sessionId: number
// }
// interface PausePayload {
//     sessionId: number
//     remainingSeconds: number
// }
// interface AnswerPayload {
//     examSessionId: number
//     sessionQuestionId: number
//     questionId: number
//     optionId: number
//     answeredAt: string
// }

// export const registerExamHandlers = (socket: Socket, ctx: ExamContext) => {
//     const examAnswerLogService = container.resolve(ExamAnswerLogService)
//     const examSessionService = container.resolve(ExamSessionService)
//     const studentService = container.resolve(StudentService)
//     let activeExamSessionId: number | null = null
//     let activeRemainingSeconds: number | null = null

//     socket.on('session:join', async (payload: JoinPayload) => {
//         const { sessionId: examSessionId } = payload

//         if (!examSessionId) {
//             socket.emit('session:error', { reason: 'Missing examSessionId' })
//             return
//         }

//         try {
//             await socket.join(`exam:${examSessionId}`)
//             activeExamSessionId = examSessionId

//             const rows = await AppDataSource.manager.query(
//                 `SELECT
//            es.startedAt,
//            es.exam_session_status AS status,
//            es.remainingSeconds,
//            qm.time                AS durationMinutes
//          FROM sem_exam_session es
//          JOIN sem_exam_schedule    esc ON esc.id         = es.examSchedulingId
//          JOIN sem_student          st  ON st.id          = es.studentId
//          JOIN sem_question_mapping qm  ON qm.crmCourseId = st.courseId
//          WHERE es.id = ? AND es.isDeleted = 0
//          LIMIT 1`,
//                 [examSessionId]
//             )

//             if (!rows?.length) {
//                 socket.emit('session:error', {
//                     reason: 'Exam session not found',
//                 })
//                 return
//             }

//             const { startedAt, status, durationMinutes, remainingSeconds } =
//                 rows[0]
// console.log(status)
//             if (status === 'SUBMITTED') {
//                 socket.emit('exam:forceSubmit', { reason: 'Already submitted' })
//                 return
//             }

//             let timeLeftSec: number

//             if (remainingSeconds !== null && remainingSeconds !== undefined) {
//                 timeLeftSec = Number(remainingSeconds)
//                 console.log(
//                     `session:join RESUME — saved remainingSeconds: ${timeLeftSec}`
//                 )
//             } else {
//                 const durationMs = Number(durationMinutes) * 60 * 1000
//                 const elapsedMs = Date.now() - new Date(startedAt).getTime()
//                 timeLeftSec = Math.max(
//                     0,
//                     Math.floor((durationMs - elapsedMs) / 1000)
//                 )
//                 console.log(
//                     `session:join FRESH — calculated timeLeft: ${timeLeftSec}`
//                 )
//             }

//             if (timeLeftSec <= 0) {
//                 socket.emit('exam:forceSubmit', { reason: 'Time expired' })
//                 return
//             }

//             activeRemainingSeconds = timeLeftSec

//             socket.emit('session:timeLeft', timeLeftSec)
//             console.log(
//                 `session:join done — examSessionId: ${examSessionId}, userId: ${ctx.userId}, timeLeft: ${timeLeftSec}s`
//             )
//         } catch (err) {
//             console.error('session:join error:', err)
//             socket.emit('session:error', { reason: 'Internal error' })
//         }
//     })
//     socket.on('exam:inactiveStudent', async ({ sessionId, studentId }) => {
//         try {
//             const result = await studentService.getStudentById(studentId)

//             if (!result?.student?.length) {
//                 socket.emit('session:error', { reason: 'Student not found' })
//                 return
//             }

//             const student = result.student[0]
//             const studentName = `${student.firstName} ${student.lastName}`

//             const sessionRows = await AppDataSource.manager.query(
//                 `SELECT examSchedulingId AS scheduleId
//              FROM sem_exam_session
//              WHERE id = ? AND isDeleted = 0
//              LIMIT 1`,
//                 [sessionId]
//             )
//             const scheduleId = sessionRows[0]?.scheduleId ?? null

//             await examSessionService.updateStudentExamStatus(
//                 sessionId,
//                 ExamSessionStatus.SUSPENDED
//             )

//             const io = getIO()
//             io.to('SUPERADMIN').emit('admin:studentInactive', {
//                 sessionId,
//                 scheduleId,
//                 studentName,
//                 inactiveAt: new Date().toISOString(),
//                 message: `${studentName} was inactive and has been suspended.`,
//             })

//             socket.emit('exam:suspended', {
//                 reason: 'inactivity',
//                 message: 'You were suspended due to inactivity. Contact admin.',
//             })
//         } catch (err) {
//             console.error('exam:inactiveStudent error:', err)
//             socket.emit('session:error', { reason: 'Internal error' })
//         }
//     })
//     socket.on('session:pause', async (payload: PausePayload) => {
//         const { sessionId: examSessionId, remainingSeconds } = payload

//         if (!examSessionId || remainingSeconds === undefined) return

//         activeRemainingSeconds = remainingSeconds

//         try {
//             await AppDataSource.manager.query(
//                 `UPDATE sem_exam_session
//          SET remainingSeconds = ?
//          WHERE id = ? AND isDeleted = 0`,
//                 [remainingSeconds, examSessionId]
//             )
//             console.log(
//                 `session:pause saved — examSessionId: ${examSessionId}, remaining: ${remainingSeconds}s`
//             )
//         } catch (err) {
//             console.error('session:pause error:', err)
//         }
//     })

//     socket.on(
//         'exam:answer',
//         async (payload: AnswerPayload, ack?: (r: { ok: boolean }) => void) => {
//             const { examSessionId, questionId, optionId, answeredAt } = payload

//             if (!examSessionId || !questionId || !optionId) {
//                 ack?.({ ok: false })
//                 return
//             }

//             try {
//                 const dto = new ExamAnswerLogDTO(
//                     answeredAt,
//                     questionId,
//                     optionId,
//                     examSessionId,
//                     ctx.userId
//                 )
//                 await examAnswerLogService.addAnswerLog(dto)
//                 ack?.({ ok: true })
//             } catch (err) {
//                 console.error('exam:answer socket error:', err)
//                 ack?.({ ok: false })
//             }
//         }
//     )

//     socket.on('session:leave', async (payload: JoinPayload) => {
//         await socket.leave(`exam:${payload.sessionId}`)
//         activeExamSessionId = null
//         console.log(
//             `session:leave — examSessionId: ${payload.sessionId}, userId: ${ctx.userId}`
//         )
//     })

//     socket.on('disconnect', () => {
//         console.log(
//             `disconnect — userId: ${ctx.userId}, lastKnownSession: ${activeExamSessionId}, lastKnownRemaining: ${activeRemainingSeconds}s`
//         )
//     })
// }

import { Socket } from 'socket.io'
import { container } from 'tsyringe'
import { ExamAnswerLogService } from '../../logs/examAnswerLogs/service/ExamAnswerLogs.service'
import { AppDataSource } from '../../../config/data-source'
import { ExamAnswerLogDTO } from '../../logs/examAnswerLogs/controller/ExamAnswerLogs.DTO'
import { ExamSessionService } from '../../session/examSession/service/ExamSession.service'
import { StudentService } from '../../../student/service/Student.service'
import { getIO } from '../../../socketServer'
import { ExamSessionStatus } from '../../session/examSession/types/ExamSession.types'

interface ExamContext {
    sessionId: string
    userId: string
    userType: string
}
interface JoinPayload {
    sessionId: number
}
interface PausePayload {
    sessionId: number
    remainingSeconds: number
}
interface AnswerPayload {
    examSessionId: number
    sessionQuestionId: number
    questionId: number
    optionId: number
    answeredAt: string
}

export const registerExamHandlers = (socket: Socket, ctx: ExamContext) => {
    const examAnswerLogService = container.resolve(ExamAnswerLogService)
    const examSessionService = container.resolve(ExamSessionService)
    const studentService = container.resolve(StudentService)

    let activeExamSessionId: number | null = null
    let activeRemainingSeconds: number | null = null
    let timerInterval: ReturnType<typeof setInterval> | null = null
    const startServerTimer = (initialSeconds: number) => {
        if (timerInterval) clearInterval(timerInterval)
        activeRemainingSeconds = initialSeconds

        timerInterval = setInterval(() => {
            if (
                activeRemainingSeconds === null ||
                activeRemainingSeconds <= 0
            ) {
                if (timerInterval) clearInterval(timerInterval)
                timerInterval = null
                return
            }
            activeRemainingSeconds -= 1
        }, 1000)
    }

    socket.on('session:join', async (payload: JoinPayload) => {
        const { sessionId: examSessionId } = payload

        if (!examSessionId) {
            socket.emit('session:error', { reason: 'Missing examSessionId' })
            return
        }

        try {
            await socket.join(`exam:${examSessionId}`)
            activeExamSessionId = examSessionId

            const rows = await AppDataSource.manager.query(
                `SELECT 
                   es.startedAt,
                   es.exam_session_status AS status,
                   es.remainingSeconds,
                   qm.time                AS durationMinutes
                 FROM sem_exam_session es
                 JOIN sem_exam_schedule    esc ON esc.id         = es.examSchedulingId
                 JOIN sem_student          st  ON st.id          = es.studentId
                 JOIN sem_question_mapping qm  ON qm.crmCourseId = st.courseId
                 WHERE es.id = ? AND es.isDeleted = 0
                 LIMIT 1`,
                [examSessionId]
            )

            if (!rows?.length) {
                socket.emit('session:error', {
                    reason: 'Exam session not found',
                })
                return
            }

            const { startedAt, status, durationMinutes, remainingSeconds } =
                rows[0]

            if (status === 'SUBMITTED') {
                socket.emit('exam:forceSubmit', { reason: 'Already submitted' })
                return
            }

            let timeLeftSec: number

            if (remainingSeconds !== null && remainingSeconds !== undefined) {
                timeLeftSec = Number(remainingSeconds)
                console.log(
                    `session:join RESUME — saved remainingSeconds: ${timeLeftSec}s`
                )
            } else {
                const durationMs = Number(durationMinutes) * 60 * 1000
                const elapsedMs = Date.now() - new Date(startedAt).getTime()
                timeLeftSec = Math.max(
                    0,
                    Math.floor((durationMs - elapsedMs) / 1000)
                )
                console.log(
                    `session:join FRESH — calculated timeLeft: ${timeLeftSec}s`
                )
            }

            if (timeLeftSec <= 0) {
                socket.emit('exam:forceSubmit', { reason: 'Time expired' })
                return
            }

            startServerTimer(timeLeftSec)

            socket.emit('session:timeLeft', timeLeftSec)
            console.log(
                `session:join done — examSessionId: ${examSessionId}, userId: ${ctx.userId}, timeLeft: ${timeLeftSec}s`
            )
        } catch (err) {
            console.error('session:join error:', err)
            socket.emit('session:error', { reason: 'Internal error' })
        }
    })

    socket.on('exam:inactiveStudent', async ({ sessionId, studentId }) => {
        try {
            const result = await studentService.getStudentById(studentId)
            if (!result?.student?.length) {
                socket.emit('session:error', { reason: 'Student not found' })
                return
            }

            const student = result.student[0]
            const studentName = `${student.firstName} ${student.lastName}`

            const sessionRows = await AppDataSource.manager.query(
                `SELECT examSchedulingId AS scheduleId 
                 FROM sem_exam_session 
                 WHERE id = ? AND isDeleted = 0 
                 LIMIT 1`,
                [sessionId]
            )
            const scheduleId = sessionRows[0]?.scheduleId ?? null

            if (activeRemainingSeconds !== null) {
                await AppDataSource.manager.query(
                    `UPDATE sem_exam_session 
                     SET remainingSeconds = ?
                     WHERE id = ? AND isDeleted = 0`,
                    [activeRemainingSeconds, sessionId]
                )
            }

            if (timerInterval) {
                clearInterval(timerInterval)
                timerInterval = null
            }

            await examSessionService.updateStudentExamStatus(
                sessionId,
                ExamSessionStatus.SUSPENDED
            )

            const io = getIO()
            io.to('SUPERADMIN').emit('admin:studentInactive', {
                sessionId,
                scheduleId,
                studentName,
                inactiveAt: new Date().toISOString(),
                message: `${studentName} was inactive and has been suspended.`,
            })

            socket.emit('exam:suspended', {
                reason: 'inactivity',
                message: 'You were suspended due to inactivity. Contact admin.',
            })
        } catch (err) {
            console.error('exam:inactiveStudent error:', err)
            socket.emit('session:error', { reason: 'Internal error' })
        }
    })

    socket.on('session:pause', async (payload: PausePayload) => {
        const { sessionId: examSessionId, remainingSeconds } = payload
        if (!examSessionId || remainingSeconds === undefined) return

        activeRemainingSeconds = remainingSeconds
        if (timerInterval) {
            clearInterval(timerInterval)
            timerInterval = null
        }

        try {
            await AppDataSource.manager.query(
                `UPDATE sem_exam_session 
                 SET remainingSeconds = ?
                 WHERE id = ? AND isDeleted = 0`,
                [remainingSeconds, examSessionId]
            )
            console.log(
                `session:pause saved — examSessionId: ${examSessionId}, remaining: ${remainingSeconds}s`
            )
        } catch (err) {
            console.error('session:pause error:', err)
        }
    })

    socket.on(
        'exam:answer',
        async (payload: AnswerPayload, ack?: (r: { ok: boolean }) => void) => {
            const { examSessionId, questionId, optionId, answeredAt } = payload

            if (!examSessionId || !questionId || !optionId) {
                ack?.({ ok: false })
                return
            }

            try {
                const dto = new ExamAnswerLogDTO(
                    answeredAt,
                    questionId,
                    optionId,
                    examSessionId,
                    ctx.userId
                )
                await examAnswerLogService.addAnswerLog(dto)

                if (activeRemainingSeconds !== null) {
                    AppDataSource.manager
                        .query(
                            `UPDATE sem_exam_session 
                     SET remainingSeconds = ?
                     WHERE id = ? AND isDeleted = 0`,
                            [activeRemainingSeconds, examSessionId]
                        )
                        .catch((err: Error) =>
                            console.error(
                                'remainingSeconds persist error:',
                                err
                            )
                        )
                }

                ack?.({ ok: true })
            } catch (err) {
                console.error('exam:answer socket error:', err)
                ack?.({ ok: false })
            }
        }
    )

    socket.on('session:leave', async (payload: JoinPayload) => {
        await socket.leave(`exam:${payload.sessionId}`)
        if (timerInterval) {
            clearInterval(timerInterval)
            timerInterval = null
        }
        activeExamSessionId = null
        console.log(
            `session:leave — examSessionId: ${payload.sessionId}, userId: ${ctx.userId}`
        )
    })

    socket.on('disconnect', () => {
        if (timerInterval) {
            clearInterval(timerInterval)
            timerInterval = null
        }
        console.log(
            `disconnect — userId: ${ctx.userId}, lastKnownSession: ${activeExamSessionId}, lastKnownRemaining: ${activeRemainingSeconds}s`
        )
    })
}
