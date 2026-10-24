import {
    Column,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm'
import { Crud } from '../../../../common/entity/Crud'
import { Question } from '../../../../examQuestion/question/entity/Question'
import { ExamSession } from '../../../session/examSession/entity/ExamSession'
import { Option } from '../../../../examQuestion/option/entity/Option'

@Entity('sem_exam_answerLogs')
@Index('uq_session_question', ['examSession', 'question'], { unique: true })
export class ExamAnswerLogs {
    @PrimaryGeneratedColumn()
    id!: number

    @Column()
    answeredAt!: string

    @Column({ type: 'tinyint', default: 0 })
    isCorrect!: 0 | 1

    @ManyToOne(() => Question, (question) => question.examAnswerLogs, {
        eager: true,
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'questionId' })
    question!: Question

    @ManyToOne(() => Option, (option) => option.examAnswerLogs, {
        eager: true,
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'optionId' })
    option!: Option

    @ManyToOne(() => ExamSession, (examSession) => examSession.examAnswerLogs, {
        eager: true,
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'examSessionId' })
    examSession!: ExamSession

    @Column(() => Crud, { prefix: false })
    Cruds!: Crud
}
