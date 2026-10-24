import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm'

import { Crud } from '../../common/entity/Crud'
import { StudentLogin } from '../../security/studentLogin/entity/StudentLogin'
import { ExamSession } from '../../exam-mgt/session/examSession/entity/ExamSession'

@Entity('sem_student')
export class SEM_Student {
    @PrimaryGeneratedColumn()
    id!: number

    @Column({ unique: true })
    admissionNumber!: string

    @Column()
    firstName!: string

    @Column()
    lastName!: string

    @Column()
    phoneNumber!: string

    @Column()
    whatsappNumber!: string

    @Column({ nullable: true })
    photoName!: string

    @Column()
    gender!: string

    @Column()
    address!: string


    @Column()
    city!: string

    @Column()
    state!: string

    @Column()
    pincode!: number

    @Column()
    parentOrGuardianName!: string

    @Column()
    parentOrGuardianNumber!: string

    @Column()
    counselledBy!: string

    @Column()
    courseId!: number

    @Column({ type: 'char', length: 10 })
    dateOfBirth!: string

    @Column()
    qualification!: string

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    totalFees!: number

    @Column()
    notes!: string

    @Column()
    academicYear!: number

    @Column({ type: 'char', length: 10 })
    dateOfAdmission!: string

    @Column({ type: 'char', length: 8, nullable: true })
    branchId!: string

    @Column({ name: 'email' })
    email!: string
    @Column(() => Crud, { prefix: false })
    Cruds!: Crud

    @Column({ name: 'courseName' })
    courseName!: string

    @Column({ name: 'branchName', nullable: true })
    branchName!: string

    @OneToMany(() => StudentLogin, (login) => login.sem_student)
    sem_user!: StudentLogin[]

    @OneToMany(() => ExamSession, (exam_session) => exam_session.sem_student)
    exam_session!: ExamSession[]
}
