import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm'
import { Crud } from '../../../common/entity/Crud'
import { SEM_RoleModuleAccess } from '../../roleModuleAccess/entity/RoleModuleAccess'
import { SEM_User } from '../../../user/entity/User'

@Entity('sem_role')
export class SEM_Role {
    @PrimaryGeneratedColumn()
    id!: number

    @Column({ name: 'name', type: 'varchar', length: 100, unique: true })
    name!: string

    @OneToMany(() => SEM_RoleModuleAccess, (rma) => rma.role)
    roleModuleAccesses!: SEM_RoleModuleAccess[]

    @Column({ type: 'tinyint', name: 'isSystemRole', default: false })
    isSystemRole!: boolean

    @OneToMany(() => SEM_User, (user) => user.sem_role)
    sem_user!: SEM_User[]

    @Column(() => Crud, { prefix: false })
    Cruds!: Crud
}
