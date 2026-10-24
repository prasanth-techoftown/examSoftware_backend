import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { Crud } from '../../../common/entity/Crud'
import { Question } from '../../question/entity/Question'
import { sem_QuestionMapping } from '../../questionMapping/entity/QuestionMapping'

@Entity({ name: 'sem_questioncourse' })
export class SEM_QuestionCourse {
    @PrimaryGeneratedColumn()
    id!: number

    @Column({ name: 'name' })
    name!: string

    @OneToMany(() => Question, (question) => question.course)
    question!: Question[]
    @OneToMany(
        () => sem_QuestionMapping,
        (examCourse) => examCourse.questionCourse
    )
    examCourse!: sem_QuestionMapping[]
    @Column(() => Crud, { prefix: false })
    Cruds!: Crud
}
