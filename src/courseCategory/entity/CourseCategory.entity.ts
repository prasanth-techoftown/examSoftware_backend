import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { Crud } from '../../common/entity/Crud'

@Entity({ name: 'sem_coursecategory' })
export class SEM_CourseCategory {
    @PrimaryGeneratedColumn()
    id!: number

    @Column({ name: 'name', length: 254 })
    name!: string

    @Column(() => Crud, { prefix: false })
    Cruds!: Crud
}
