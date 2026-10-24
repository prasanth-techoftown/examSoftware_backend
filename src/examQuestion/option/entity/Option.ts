import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
} from 'typeorm'
import { Question } from '../../question/entity/Question'
import { Crud } from '../../../common/entity/Crud'
import { ExamAnswerLogs } from '../../../exam-mgt/logs/examAnswerLogs/entity/ExamAnswerLogs'

@Entity({ name: 'options' })
export class Option {
    @PrimaryGeneratedColumn()
    id!: number

    @Column()
    name!: string

    @Column()
    isAnswer!: boolean

    @ManyToOne(() => Question, (question) => question.option, {
        eager: true,
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'questionId' })
    question!: Question
    @OneToMany(() => ExamAnswerLogs, (examAnswerLogs) => examAnswerLogs.option)
    examAnswerLogs!: ExamAnswerLogs[]

    @Column(() => Crud, { prefix: false })
    Cruds!: Crud
}
