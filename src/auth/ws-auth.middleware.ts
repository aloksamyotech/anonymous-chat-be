import { Injectable, NestMiddleware } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';

@Injectable()
export class WsAuthMiddleware implements NestMiddleware {
    constructor(private jwtService: JwtService) { }

    use(socket: Socket, next: Function) {
        const token = socket.handshake.headers?.token;
        console.log("token=========>", token);
        if (!token) {
            return next(new Error('Unauthorized'));
        }
      
          if (!token || typeof token !== 'string') {
            return next(new Error('sajsdakslasajs'));
          }
        try {
            const payload = this.jwtService.verify(token, {
                secret: process.env.JWT_SECRET,
            });

            console.log("payload====>", payload);
            socket['user'] = payload;
            next();
        } catch (error) {
            console.log("error===>", error);
            return next(new Error('sdsdaaaaaaaaaaaaaaaaaaaaaa'));
        }
    }
}
