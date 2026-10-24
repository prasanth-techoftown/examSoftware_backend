import {
    Column,
    Entity,
    Index,
    OneToMany,
    PrimaryGeneratedColumn,
} from 'typeorm'
import { Crud } from '../../../common/entity/Crud'
import { ExamStatus } from '../types/ExamRequest.types'
import { ExamScheduling } from '../../scheduling/entity/Scheduling'

@Entity({ name: 'exam_request' })
export class ExamRequest {
    @PrimaryGeneratedColumn()
    id!: number

    @Column({
        name: 'status',
        type: 'enum',
        enum: ExamStatus,
        default: ExamStatus.PENDING,
    })
    status!: ExamStatus
   @Index({ unique: true })
@Column({ name: 'studentId' })
studentId!: number

    @Column({ name: 'attemptNumber', default: 1 })
    attemptNumber!: number

    @Column({ name: 'reason', nullable: true, type: 'text' })
    reason!: string

    @Column({ name: 'examDate',  nullable: true, })
    examDate!: string
    @Column({ name: 'date' })
    date!: string
    @Column({ name: 'time' })
    time!: string
    @OneToMany(
        () => ExamScheduling,
        (exam_schedule) => exam_schedule.exam_session
    )
    exam_schedule!: ExamScheduling[]
    @Column(() => Crud, { prefix: false })
    Cruds!: Crud
}
