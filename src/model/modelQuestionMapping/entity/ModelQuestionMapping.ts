import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm'
import { Crud } from '../../../common/entity/Crud'
import { SEM_ModelTitle } from '../../title/entity/ModelTitle.entity'
import { SEM_ModelSubject } from '../../subject/entity/ModelSubject.entity'

@Entity({ name: 'sem_model_question_mapping' })
export class sem_ModelQuestionMapping {
    @PrimaryGeneratedColumn()
    id!: number

    @ManyToOne(
        () => SEM_ModelSubject,
        (modelSubject) => modelSubject.modelQuestionMapping,
        {
            eager: true,
            onDelete: 'CASCADE',
        }
    )
    @JoinColumn({ name: 'modelSubjectId' })
    modelSubject!: SEM_ModelSubject

    @ManyToOne(
        () => SEM_ModelTitle,
        (modelTitle) => modelTitle.modelQuestionMapping,
        {
            eager: true,
            onDelete: 'CASCADE',
        }
    )
    @JoinColumn({ name: 'titleId' })
    title!: SEM_ModelTitle

    @Column()
    courseTotalQuestion!: number

    @Column()
    subjectTotalQuestion!: number

    @Column()
    time!: number

    @Column(() => Crud, { prefix: false })
    Cruds!: Crud
}
