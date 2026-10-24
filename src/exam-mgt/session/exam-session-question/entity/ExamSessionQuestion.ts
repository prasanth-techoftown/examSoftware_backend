import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm'
import { Crud } from '../../../../common/entity/Crud'
import { Question } from '../../../../examQuestion/question/entity/Question'
import { ExamSession } from '../../examSession/entity/ExamSession'

@Entity('sem_exam_session_question')
export class ExamSessionQuestion {
    @PrimaryGeneratedColumn()
    id!: number

    @ManyToOne(() => Question, (question) => question.examSessionQuestion, {
        eager: true,
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'questionId' })
    question!: Question

    @ManyToOne(
        () => ExamSession,
        (examSession) => examSession.examSessionQuestion,
        {
            eager: true,
            onDelete: 'CASCADE',
        }
    )
    @JoinColumn({ name: 'examSessionId' })
    examSession!: ExamSession

    @Column(() => Crud, { prefix: false })
    Cruds!: Crud
}
