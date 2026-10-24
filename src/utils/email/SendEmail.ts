import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
dotenv.config()

export interface EmailOptions {
    to: string
    subject: string
    message: string
}

export const sendEmail = async (options: EmailOptions) => {
    const transporter = nodemailer.createTransport({
        host: process.env.SMPT_HOST,
        port: Number(process.env.SMPT_PORT),
        service: process.env.SMPT_SERVICE,
        auth: {
            user: process.env.SMPT_MAIL,
            pass: process.env.SMPT_APP_PASS,
        },
    })

    await transporter.sendMail({
        from: process.env.SMPT_MAIL,
        to: options.to,
        subject: options.subject,
        html: options.message,
    })
}
