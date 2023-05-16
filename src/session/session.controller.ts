import { Controller, Inject, InternalServerErrorException } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Status, User } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { PubSub } from 'graphql-subscriptions';
import parse from 'parse-duration';
import { RedisService } from '../redis/redis.service';
import { Handlers } from '../redis/redis.strategy';
import { SessionService } from './session.service';

interface Message<T> {
  data: T
}

@Controller()
export class SessionController {
  constructor(
    private readonly sessionService: SessionService,
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
    @Inject('PUB_SUB')
    private readonly pubSub: PubSub,
  ) {}

  @MessagePattern(Handlers.KEY_EVENT_EXPIRED)
  async session(
    @Payload() id: number,
  ) {
    const user = await this.sessionService.current(id);
    switch (user.status) {
      case Status.ACTIVE:
        await this.redisService.emit(Status.INACTIVE, user);
        break;
      case Status.INACTIVE:
        await this.redisService.emit(Status.ACTIVE, user);
        break;
      default:
        throw new InternalServerErrorException('...');
    }
  }

  @MessagePattern(Status.ACTIVE)
  async active(
    @Payload() message: Message<Partial<User>>,
  ): Promise<void> {
    const num = this.configService.get('SESSION_ACTIVE');

    const id = message.data.id;
    await this.redisService.set(id, Status.ACTIVE);
    await this.redisService.expire(id, parse(num, 's'));

    const user = await this.sessionService.change(id, Status.ACTIVE);
    this.pubSub.publish('user', { user });
  }

  @MessagePattern(Status.INACTIVE)
  async inactive(
    @Payload() message: Message<Partial<User>>,
  ): Promise<void> {
    const num = this.configService.get('SESSION_INACTIVE');

    const id = message.data.id;
    await this.redisService.set(id, Status.INACTIVE);
    await this.redisService.expire(id,  parse(num, 's'));

    const user = await this.sessionService.change(id, Status.INACTIVE);
    this.pubSub.publish('user', { user });
  }
}