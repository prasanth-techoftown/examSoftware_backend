import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryColumn,
} from 'typeorm'
import { SEM_Student } from '../../../../student/entity/student.entity'
import { Crud } from '../../../../common/entity/Crud'
import { ExamScheduling } from '../../../scheduling/entity/Scheduling'
import { ExamAnswerLogs } from '../../../logs/examAnswerLogs/entity/ExamAnswerLogs'
import { ExamSessionQuestion } from '../../exam-session-question/entity/ExamSessionQuestion'
import { ExamResultStatus, ExamSessionStatus } from '../types/ExamSession.types'

@Entity('sem_exam_session')
export class ExamSession {
    @PrimaryColumn({ type: 'char', length: 8, name: 'id' })
    id!: string

    @Column({
        type: 'enum',
        default: ExamSessionStatus.IN_PROGRESS,
        enum: ExamSessionStatus,
    })
    exam_session_status!: ExamSessionStatus

    @Column({
        type: 'enum',
        default: null,
        enum: ExamResultStatus,
    })
    result_status!: ExamResultStatus
    @Column({ type: 'int', default: null })
    remainingSeconds!: number
    @Column({ default: '' })
    startedAt!: string

    @Column({ default: '' })
    submittedAt!: string

    @Column({ type: 'int', default: 0 })
    score!: number
    @Column({ default: null })
    grade!: string

    @Column({ type: 'int', default: 0 })
    percentage!: number

    @Column({ type: 'int', default: 0 })
    totalQuestion!: number

    @Column({ type: 'int', default: 0 })
    attendedQuestions!: number

    @ManyToOne(() => SEM_Student, (student) => student.exam_session, {
        eager: true,
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'studentId' })
    sem_student!: SEM_Student

    @ManyToOne(
        () => ExamScheduling,
        (exam_scheduling) => exam_scheduling.exam_session,
        {
            eager: true,
            onDelete: 'CASCADE',
        }
    )
    @JoinColumn({ name: 'examSchedulingId' })
    exam_scheduling!: ExamScheduling

    @OneToMany(
        () => ExamAnswerLogs,
        (examAnswerLogs) => examAnswerLogs.examSession
    )
    examAnswerLogs!: ExamAnswerLogs[]

    @OneToMany(
        () => ExamSessionQuestion,
        (examSessionQuestion) => examSessionQuestion.examSession
    )
    examSessionQuestion!: ExamSessionQuestion[]

    @Column(() => Crud, { prefix: false })
    Cruds!: Crud
}
