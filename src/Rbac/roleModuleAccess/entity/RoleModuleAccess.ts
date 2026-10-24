import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    Unique,
} from 'typeorm'
import { SEM_Role } from '../../role/entity/Role'
import { SEM_Access } from './Access'
import { Crud } from '../../../common/entity/Crud'
import { SEM_FrontendModuleEntity } from '../../frontEndModules/entity/FrontendModule'

@Entity('sem_role_module_access_tbl')
@Unique(['role', 'module', 'access'])
export class SEM_RoleModuleAccess {
    @PrimaryGeneratedColumn()
    id!: number

    @ManyToOne(() => SEM_Role, (role) => role.roleModuleAccesses, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'role_id', referencedColumnName: 'id' })
    role!: SEM_Role

    @ManyToOne(() => SEM_FrontendModuleEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'module_id' })
    module!: SEM_FrontendModuleEntity

    @ManyToOne(() => SEM_Access, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'access_id' })
    access!: SEM_Access

    @Column(() => Crud, { prefix: false })
    Cruds!: Crud
}
