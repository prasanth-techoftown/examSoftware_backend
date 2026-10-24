export interface MulterFiletypes extends Express.Multer.File {
    fileName: string
    filePath: string
    uploadPath: string
}
