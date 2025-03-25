import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailerService {
    private transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        });
    }

    async sendOtpEmail(to: string, otp: string): Promise<Boolean> {
        console.log("to======>", to);
        console.log("process.env.EMAIL_USER", process.env.EMAIL_USER);
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject: 'Your OTP Code',
            text: `Your OTP code is: ${otp}`,
            html: `<p>Your OTP code is: <strong>${otp}</strong></p>`,
        };

        try {
            await this.transporter.sendMail(mailOptions);
            console.log('OTP email sent successfully');
            return true;
        } catch (error) {
            console.error('Error sending OTP email', error);
            return false;
        }
    }
}
