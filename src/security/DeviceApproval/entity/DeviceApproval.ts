import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
} from 'typeorm'

export enum Status {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
}

@Entity('device_approval')
export class DeviceApproval {
    @PrimaryGeneratedColumn()
    id!: number

    @Column()
    userId!: string
    @Column()
    userName!: string

    // @Column({nullable:true})
    // oldDevice!: string;

    @Column({ nullable: true, unique: true })
    newDevice!: string

    @Column()
    date!: string

    @Column()
    time!: string

    @Column()
    ipAddress!: string

    @Column({ type: 'text' })
    userAgent!: string

    @Column()
    platform!: string

    @Column()
    language!: string

    @Column()
    timezone!: string

    @Column()
    screen!: string

    @Column({
        name: 'status',
        type: 'enum',
        enum: Status,
        default: Status.PENDING,
    })
    status!: Status

    @CreateDateColumn()
    createdAt!: Date

    getId(): number {
        return this.id
    }

    getUserId(): string {
        return this.userId
    }

    setUserId(value: string): void {
        this.userId = value
    }

    // getOldDevice(): string {
    //   return this.oldDevice;
    // }

    // setOldDevice(value: string): void {
    //   this.oldDevice = value;
    // }

    getNewDevice(): string {
        return this.newDevice
    }

    setNewDevice(value: string): void {
        this.newDevice = value
    }

    getStatus(): Status {
        return this.status
    }

    setStatus(value: Status): void {
        this.status = value
    }

    getCreatedAt(): Date {
        return this.createdAt
    }
}
