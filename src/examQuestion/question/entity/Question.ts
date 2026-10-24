import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
} from 'typeorm'
import { Crud } from '../../../common/entity/Crud'
import { Option } from '../../option/entity/Option'

import { QuestionInputMode } from '../enums/Question.enum'
import { SEM_QuestionCourse } from '../../subject/entity/QuestionCourse.entity'
import { ExamAnswerLogs } from '../../../exam-mgt/logs/examAnswerLogs/entity/ExamAnswerLogs'
import { ExamSessionQuestion } from '../../../exam-mgt/session/exam-session-question/entity/ExamSessionQuestion'
@Entity({ name: 'question' })
export class Question {
    @PrimaryGeneratedColumn()
    id!: number

    @Column({ type: 'enum', enum: QuestionInputMode })
    inputMethod!: QuestionInputMode

    @Column({ type: 'text', nullable: false })
    question!: string

    @ManyToOne(() => SEM_QuestionCourse, (course) => course.question, {
        eager: true,
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'courseId' })
    course!: SEM_QuestionCourse

    @OneToMany(() => Option, (option) => option.question)
    option!: Option[]

    @OneToMany(
        () => ExamSessionQuestion,
        (examSessionQuestion) => examSessionQuestion.question
    )
    examSessionQuestion!: ExamSessionQuestion[]

    @OneToMany(
        () => ExamAnswerLogs,
        (examAnswerLogs) => examAnswerLogs.question
    )
    examAnswerLogs!: ExamAnswerLogs[]

    @Column(() => Crud, { prefix: false })
    Cruds!: Crud
}
