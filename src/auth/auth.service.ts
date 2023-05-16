import { BadRequestException, Injectable } from '@nestjs/common';
import { User, Status } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { compareSync, genSaltSync, hashSync } from 'bcrypt';
import * as dayjs from 'dayjs';
import parse from 'parse-duration';
import { PrismaService } from '../prisma/prisma.service';
import { Token } from '../types/token';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private configService: ConfigService,
    private jwtService: JwtService,
    private redisService: RedisService
  ) {}

  async signUp(email: string, password: string): Promise<User> {
    const data = { email, password: hashSync(password, genSaltSync()) };
    return this.prismaService.user.create({ data });
  }

  async signIn(email: string, password: string): Promise<Token> {
    const where = { email };
    const user = await this.prismaService.user.findUnique({ where });

    if (!compareSync(password, user.password)) {
      throw new BadRequestException('...');
    }

    await this.redisService.emit(Status.ACTIVE, user);

    const token = this.token(user);
    const tokenExpiredAt = this.tokenExpiredAt();
    return { token, tokenExpiredAt };
  }

  private token(user: User): string {
    const { id, email } = user;
    return this.jwtService.sign({ id, email });
  }

  private tokenExpiredAt(): string {
    const num = this.configService.get('JWT_EXPIRES_IN');
    return dayjs().set('millisecond', parse(num)).format();
  }
}
