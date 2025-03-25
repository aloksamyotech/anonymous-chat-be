import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.services';
import { MailerService } from '../../mailer/mailer.service';
import { CreateUserDto } from './user.dto';
import { Prisma } from '@prisma/client';
const crypto = require("crypto");

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private mailerService: MailerService
  ) { }

  generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  hashData(data: string): string {
    return crypto.createHash("sha256").update(data).digest("hex");
  }

  generateKeyPair() {
    const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
      modulusLength: 2048,
      publicKeyEncoding: { type: "spki", format: "pem" },
      privateKeyEncoding: { type: "pkcs8", format: "pem" },
    });

    return { publicKey, privateKey };
  }

  extractKey(pemKey:string) {
    return pemKey
      .replace(/-----BEGIN .*?-----/g, "") // Remove BEGIN line
      .replace(/-----END .*?-----/g, "")   // Remove END line
      .replace(/\n/g, "")                  // Remove new lines
      .trim();                              // Trim spaces
  }

  async createUser(data: { email: string }) {
    const otp = this.generateOtp();

    const is_send = await this.mailerService.sendOtpEmail(data?.email, otp)
    if (!is_send) {
      throw new InternalServerErrorException("Internal server error")
    }

    console.log("hash email====>", this.hashData(data.email));
    const user = await this.prisma.user.upsert({
      where: { email: this.hashData(data.email) },
      create: {                              // Data to create a new user if it doesn't exist
        email: this.hashData(data.email),
        otp: this.hashData(otp),
      },
      update: {                              // Data to update the existing user if it exists
        otp: this.hashData(otp),
        isActive: true,
      },
    });

    return {
      user,
      otp
    }
  }

  async verifyOtp(data: { email: string, otp: string }) {

    const emailHash = this.hashData(data.email);
    const otpHash = this.hashData(data.otp);

    const user = await this.prisma.user.findUnique({
      where: {
        email: emailHash,
      },
    })

    console.log(user);

    if (!user) {
      throw new NotFoundException("Email not found");
    }

    if (user.otp !== otpHash) {
      throw new BadRequestException("Invalid OTP!")
    }

    console.log(user.publicKey);
    if (user.publicKey) {
      return user;  
    }

    const keys = this.generateKeyPair();
    console.log("Public Key:\n", keys.publicKey);
    console.log("Private Key:\n", keys.privateKey);

    const updatedUser = await this.prisma.user.update({
      where: {
        email: emailHash,
      },
      data: {
        publicKey: this.extractKey(keys.publicKey),
      },
    })

    console.log("updatedUser=====>", updatedUser);

    return {
      user,
      publickey: this.extractKey(keys.publicKey),
      privatekey: this.extractKey(keys.privateKey)
    }

  }
}
