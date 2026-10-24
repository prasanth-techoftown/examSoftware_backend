import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm'

import { Crud } from '../../common/entity/Crud'

@Entity('sem_date_schedule')
@Index(['year', 'month', 'date'], { unique: true })
@Index(['year', 'month'])
export class SEM_DateSchedule {
    @PrimaryGeneratedColumn()
    id!: number

    @Column({ type: 'int' })
    date!: number

    @Column({ type: 'int' })
    month!: number

    @Column({ type: 'int' })
    year!: number

    @Column(() => Crud, { prefix: false })
    Cruds!: Crud
}
