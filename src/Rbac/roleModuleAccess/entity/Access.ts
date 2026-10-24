import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm'
import { Access } from '../../../constant/enum/AccessControl.enum'

@Entity('sem_access_tbl')
export class SEM_Access {
    @PrimaryGeneratedColumn()
    id!: number

    @Column({ type: 'enum', enum: Access, unique: true })
    name!: Access
}
