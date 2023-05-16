import { Injectable } from '@nestjs/common';
import { User, Status } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SessionService {
  constructor(
    private prismaService: PrismaService,
  ) {}

  async current(id: number): Promise<Partial<User>> {
    const where = { id };
    return this.prismaService.user.findUnique({ where });
  }

  async change(id: number, status: Status): Promise<User> {
    const where = { id };
    const data = { status };
    return this.prismaService.user.update({ where, data });
  }
}
