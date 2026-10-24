import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm'
import { Crud } from '../../common/entity/Crud'
@Entity('sem_grade')
export class SEM_GradeEntity {
    @PrimaryGeneratedColumn()
    id!: number

    @Column()
    grade!: string

    @Column()
    minRange!: number

    @Column()
    maxRange!: number

    @Column(() => Crud, { prefix: false })
    Cruds!: Crud
}
