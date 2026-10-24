import {
    BeforeInsert,
    Column,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryColumn,
} from 'typeorm'
import * as bcrypt from 'bcrypt'
import { Crud } from '../../common/entity/Crud'
import { SEM_Admin } from '../../admin/entity/Admin'
import { SEM_Role } from '../../Rbac/role/entity/Role'
import { generateSnowflakeId } from '../../utils/snowflake'

@Entity({ name: 'sem_user' })
export class SEM_User {
    @PrimaryColumn({ type: 'char', length: 8, name: 'id' })
    @Index('idx_user_email')
    id!: string

    @BeforeInsert()
    async beforeInsert() {
        if (!this.id) this.id = generateSnowflakeId()
        if (this.password && !this.password.startsWith('$2b$')) {
            this.password = await bcrypt.hash(this.password, 10)
        }
    }

    @Column({ name: 'firstName' })
    firstName!: string

    @Column({ name: 'phoneNumber', nullable: true })
    phoneNumber!: string

    @Column({ name: 'lastName', nullable: true })
    lastName!: string

    @Column({ name: 'password' })
    password!: string

    @Column({ name: 'deviceFingerprint', nullable: true })
    deviceFingerprint!: string

    @Column({ name: 'email' })
    email!: string

    @Column({ name: 'userName' })
    userName!: string

    @Column({ name: 'ip', nullable: true })
    ip!: string
    @Column(() => Crud, { prefix: false })
    Cruds!: Crud

    @OneToMany(() => SEM_Admin, (admin) => admin.user)
    admin!: SEM_Admin[]

    @ManyToOne(() => SEM_Role, (role) => role.sem_user, {
        eager: true,
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'roleId' })
    sem_role!: SEM_Role
}
