import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { Crud } from '../../../common/entity/Crud'
import { sem_ModelQuestionMapping } from '../../modelQuestionMapping/entity/ModelQuestionMapping'

@Entity({ name: 'sem_model_subject' })
export class SEM_ModelSubject {
    @PrimaryGeneratedColumn()
    id!: number

    @Column({ name: 'name' })
    name!: string

    @OneToMany(
        () => sem_ModelQuestionMapping,
        (modelQuestionMapping) => modelQuestionMapping.modelSubject
    )
    modelQuestionMapping!: sem_ModelQuestionMapping[]
    @Column(() => Crud, { prefix: false })
    Cruds!: Crud
}
