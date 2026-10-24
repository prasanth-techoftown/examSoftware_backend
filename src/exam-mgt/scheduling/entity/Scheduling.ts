import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    OneToMany,
} from 'typeorm'
import { ExamScheduleStatus } from '../types/Scheduling.types'
import { SEM_Student } from '../../../student/entity/student.entity'
import { Crud } from '../../../common/entity/Crud'
import { ExamSession } from '../../session/examSession/entity/ExamSession'
import { ExamRequest } from '../../examRequest/entity/ExamRequest'

@Entity('sem_exam_schedule')
export class ExamScheduling {
    @PrimaryGeneratedColumn()
    id!: number

    @Column({ type: 'date' })
    examDate!: string

    @Column({
        type: 'enum',
        enum: ExamScheduleStatus,
        default: ExamScheduleStatus.SCHEDULED,
    })
    status!: ExamScheduleStatus

    @ManyToOne(() => SEM_Student)
    @JoinColumn({ name: 'studentId' })
    student!: SEM_Student
    @OneToMany(
        () => ExamSession,
        (exam_session) => exam_session.exam_scheduling
    )
    exam_session!: ExamSession[]
    @ManyToOne(() => ExamRequest, (examRequest) => examRequest.exam_schedule, {
        nullable: true,
    })
    @JoinColumn({ name: 'examRequestId' })
    examRequest!: ExamRequest | null

    @Column(() => Crud, { prefix: false })
    Cruds!: Crud
}
