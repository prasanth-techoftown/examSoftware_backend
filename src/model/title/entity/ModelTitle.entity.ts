import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { Crud } from '../../../common/entity/Crud'
import { sem_ModelQuestionMapping } from '../../modelQuestionMapping/entity/ModelQuestionMapping'

@Entity({ name: 'sem_model_title' })
export class SEM_ModelTitle {
    @PrimaryGeneratedColumn()
    id!: number

    @Column({ name: 'name' })
    name!: string
    @OneToMany(
        () => sem_ModelQuestionMapping,
        (modelQuestionMapping) => modelQuestionMapping.title
    )
    modelQuestionMapping!: sem_ModelQuestionMapping[]
    @Column(() => Crud, { prefix: false })
    Cruds!: Crud
}
