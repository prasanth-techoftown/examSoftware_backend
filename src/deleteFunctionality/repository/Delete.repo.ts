// import { AppDataSource } from '../../config/data-source'

// export class DeleteRepository {
//     async softDelete(
//         tableName: string,
//         id: string,
//         deletedBy: string
//     ): Promise<void> {
//         await AppDataSource.manager.query(
//             `
//       UPDATE ${tableName}
//       SET isDeleted = 1, deletedBy = ?
//       WHERE id = ?
//       `,
//             [deletedBy, id]
//         )
//     }

//     async checkIsDeleted(
//         tableName: string,
//         id: string
//     ): Promise<{ isDeleted: number }[]> {
//         return AppDataSource.manager.query(
//             `
//       SELECT isDeleted FROM ${tableName}
//       WHERE id = ?
//       `,
//             [id]
//         )
//     }
// }
