import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm'
import { Crud } from '../../common/entity/Crud'
import { SEM_User } from '../../user/entity/User'

@Entity({ name: 'sem_admin' })
export class SEM_Admin {
    @PrimaryGeneratedColumn()
    id!: string

    @Column({ type: 'char', length: 8, name: 'userId' })
    userId!: string

    @Column(() => Crud, { prefix: false })
    Cruds!: Crud
    @ManyToOne(() => SEM_User, (user) => user.admin, {
        eager: true,
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'userId' })
    user!: SEM_User
}
