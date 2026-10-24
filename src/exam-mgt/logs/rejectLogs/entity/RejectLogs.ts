import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { Crud } from '../../../../common/entity/Crud'
import { RejectLogRole } from '../types/RejectLogs.types'

@Entity({ name: 'exam_student_reject_logs' })
export class RejectLogs {
    @PrimaryGeneratedColumn()
    id!: number

    @Column({ name: 'admissionId' })
    admissionId!: number
    @Column()
    date!: string
    @Column()
    time!: string

    @Column({ type: 'enum', enum: RejectLogRole })
    who!: RejectLogRole

    @Column({ name: 'reason', nullable: true, type: 'text' })
    reason!: string

    @Column(() => Crud, { prefix: false })
    Cruds!: Crud
}
