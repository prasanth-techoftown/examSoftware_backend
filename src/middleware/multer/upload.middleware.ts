import multer from 'multer'
import fs from 'fs'

export const uploadImage = (
    folderName: string,
    type: 'single' | 'multiple' = 'single',
    maxCount: number = 10
) => {
    const uploadPath = `uploads/${folderName}`
    if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true })
    }

    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, uploadPath)
        },
        filename: (req, file, cb) => {
            cb(null, `${Date.now()}_${file.originalname}`)
        },
    })

    const upload = multer({ storage })

    if (type === 'single') {
        return upload.single('file')
    }

    return upload.array('files', maxCount)
}
