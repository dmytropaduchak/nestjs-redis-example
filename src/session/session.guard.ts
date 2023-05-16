import { CanActivate, ExecutionContext, ForbiddenException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { RedisService } from '../redis/redis.service';
import { Status } from '@prisma/client';

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(
    @Inject(RedisService)
    private readonly RedisService: RedisService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;

    const user = request.user;
    if (!user) {
      throw new UnauthorizedException('...');
    }

    const session = await this.RedisService.get(user.id);
    if (!session || session === Status.INACTIVE) {
      throw new ForbiddenException('...');
    }
    return true;
  }
}
