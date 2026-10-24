import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm'
import { Crud } from '../../../common/entity/Crud'
import { SEM_QuestionCourse } from '../../subject/entity/QuestionCourse.entity'

@Entity({ name: 'sem_question_mapping' })
export class sem_QuestionMapping {
    @PrimaryGeneratedColumn()
    id!: number

    @ManyToOne(
        () => SEM_QuestionCourse,
        (questionCourse) => questionCourse.examCourse,
        {
            eager: true,
            onDelete: 'CASCADE',
        }
    )
    @JoinColumn({ name: 'questionCourseId' })
    questionCourse!: SEM_QuestionCourse

    @Column()
    crmCourseId!: number
    @Column()
    courseTotalQuestion!: number

    @Column()
    subjectTotalQuestion!: number

    @Column()
    time!: number

    @Column(() => Crud, { prefix: false })
    Cruds!: Crud
}
