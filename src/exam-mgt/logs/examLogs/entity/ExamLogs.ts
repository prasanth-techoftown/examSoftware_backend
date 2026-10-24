import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { ExamActivityAction } from '../types/ExamLogs.types'

@Entity('sem_exam_activity_log')
export class ExamActivityLog {
    @PrimaryGeneratedColumn()
    id!: number

    @Column({ type: 'int' })
    studentId!: number

    @Column({ type: 'int' })
    score!: number

    @Column()
    grade!: string

    @Column()
    percentage!: string

    @Column({ type: 'varchar', length: 50, nullable: true })
    result!: string

    @Column({
        type: 'enum',
        enum: ExamActivityAction,
    })
    action!: ExamActivityAction

    @Column({ nullable: true })
    examSessionId!: number
}
