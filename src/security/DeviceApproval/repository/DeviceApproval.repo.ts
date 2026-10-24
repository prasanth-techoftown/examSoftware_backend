import { injectable } from 'tsyringe'
import { AppDataSource } from '../../../config/data-source'
import { DeviceApproval, Status } from '../entity/DeviceApproval'

@injectable()
export class DeviceApprovalRepository {
    private repo = AppDataSource.getRepository(DeviceApproval)

    findById = async (id: number) => {
        return this.repo.findOneBy({ id })
    }

    approveDevice = async (id: number, status: Status) => {
        return this.repo.update({ id }, { status })
    }
    getAllDevices = async () => {
        const query = `SELECT id,userId,userName,status,date,time,ipAddress,userAgent,language,timeZone,screen,platform
    FROM device_approval
  
  `
        return AppDataSource.manager.query(query)
    }
    findByDeviceId = async (deviceId: string) => {
        return this.repo.findOne({
            where: {
                newDevice: deviceId,
            },
        })
    }
}
