import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { Crud } from '../../common/entity/Crud'

@Entity({ name: 'sem_course' })
export class SEM_Course {
    @PrimaryGeneratedColumn()
    id!: number

    @Column({ name: 'courseCode', length: 50 })
    courseCode!: string

    @Column({ name: 'name', length: 254 })
    name!: string

    @Column({ name: 'description', type: 'text', nullable: true })
    description!: string | null

    @Column({ name: 'durationInMonths', type: 'int' })
    durationInMonths!: number

    @Column({ name: 'durationInHrs', type: 'int' })
    durationInHrs!: number

    @Column({ name: 'courseCategoryId', type: 'int' })
    courseCategoryId!: number

    @Column({ name: 'isActive', type: 'tinyint', default: 1 })
    isActive!: number

    @Column(() => Crud, { prefix: false })
    Cruds!: Crud
}
