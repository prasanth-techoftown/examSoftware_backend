import { Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'

export class Crud {
    @CreateDateColumn()
    createdAt!: Date

    @Column({ default: 'system', nullable: true })
    createdBy!: string

    @UpdateDateColumn()
    updatedAt!: Date

    @Column({ nullable: true })
    updatedBy!: string

    @Column({ type: 'timestamp', nullable: true })
    deletedAt!: Date

    @Column({ default: 0, type: 'tinyint' })
    isDeleted!: number

    @Column({ nullable: true })
    deletedBy!: string
}
