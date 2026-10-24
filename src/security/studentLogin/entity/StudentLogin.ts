import {
    BeforeInsert,
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm'
import { Crud } from '../../../common/entity/Crud'
import bcrypt from 'bcrypt'
import { SEM_Student } from '../../../student/entity/student.entity'

@Entity('sem_studentLogin')
export class StudentLogin {
    @PrimaryGeneratedColumn()
    id!: number

    @Column()
    admissionNumber!: string

    @Column({ name: 'password' })
    password!: string

    @Column({ type: 'tinyint', default: 0 })
    isActive!: 0 | 1

    @BeforeInsert()
    async beforeInsert() {
        if (this.password && !this.password.startsWith('$2b$')) {
            this.password = await bcrypt.hash(this.password, 10)
        }
    }
    @ManyToOne(() => SEM_Student, (student) => student.sem_user, {
        eager: true,
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'studentId' })
    sem_student!: SEM_Student

    @Column(() => Crud, { prefix: false })
    Cruds!: Crud
}
