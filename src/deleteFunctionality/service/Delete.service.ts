// import { inject, injectable } from 'tsyringe'
// import { DeleteRepository } from '../repository/Delete.repo'
// import { DeleteResult, Status } from '../types/Delete.types'
// import { TABLES } from '../enums/Table.enums'
// import { CacheService } from '../../cache/ClearCache'
// import { TABLE_CACHE_MAP } from '../../cache/cacheTables'
// @injectable()
// export class DeleteService {
//     constructor(
//         @inject('DeleteRepository')
//         private deleteRepository: DeleteRepository,
//         private readonly clearCache: CacheService
//     ) {}

//     async deleteRecord(
//         tableName: TABLES,
//         id: string,
//         deletedBy: string
//     ): Promise<DeleteResult> {
//         const existing = await this.deleteRepository.checkIsDeleted(
//             tableName,
//             id
//         )

//         if (!existing.length || existing[0].isDeleted === 1) {
//             return { status: Status.NAME_NOT_EXIST }
//         }

//         try {
//             const cacheKeyOrFunc = TABLE_CACHE_MAP[tableName]
//             if (Array.isArray(cacheKeyOrFunc)) {
//                 for (const key of cacheKeyOrFunc) {
//                     await this.clearCache.del(key)
//                     await this.clearCache.delByPattern(key)
//                 }
//             } else if (typeof cacheKeyOrFunc === 'function') {
//                 const key = cacheKeyOrFunc(id)
//                 await this.clearCache.del(key)
//             } else if (cacheKeyOrFunc) {
//                 await this.clearCache.del(cacheKeyOrFunc)
//                 await this.clearCache.delByPattern(cacheKeyOrFunc)
//             }
//         } catch (err) {
//             console.warn('Redis cache invalidation failed', err)
//         }

//         await this.deleteRepository.softDelete(tableName, id, deletedBy)

//         return { status: Status.SUCCESS }
//     }
// }
