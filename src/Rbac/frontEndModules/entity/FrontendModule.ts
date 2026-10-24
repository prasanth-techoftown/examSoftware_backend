import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm'
import { Crud } from '../../../common/entity/Crud'
@Entity('sem_frontendModule_tbl')
export class SEM_FrontendModuleEntity {
    @PrimaryGeneratedColumn()
    id!: number

    @Column({ type: 'varchar', length: 100, unique: true })
    name!: string

    @Column(() => Crud, { prefix: false })
    Cruds!: Crud
}
