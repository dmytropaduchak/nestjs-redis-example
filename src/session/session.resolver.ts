import { Query, Resolver, Subscription } from '@nestjs/graphql';
import { Inject, UseGuards } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { Current } from '../decorators/current.decorator';
import { User } from '../types/user';
import { JwtGuard } from '../jwt/jwt.guard';
import { SessionService } from './session.service';
import { SessionGuard } from './session.guard';

@Resolver()
export class SessionResolver {
  constructor(
    private readonly sessionService: SessionService,
    @Inject('PUB_SUB')
    private readonly pubSub: PubSub,
  ) {}

  @Query(() => User)
  @UseGuards(JwtGuard, SessionGuard)
  async current(
    @Current() current: User,
  ): Promise<Partial<User>> {
    return this.sessionService.current(current.id);
  }

  @Subscription(() => User, {
    filter: (payload, variables, context) => payload.user.id === context.user.id,
  })
  async user() {
    return this.pubSub.asyncIterator('user');
  }
}
