import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { Status, User } from '@prisma/client';
import { createSandbox, SinonSandbox, SinonStubbedInstance } from 'sinon';
import { RedisService } from '../redis/redis.service';
import { SessionController } from './session.controller';
import { SessionService } from './session.service';
import { PubSub } from 'graphql-subscriptions';

describe('SessionController', () => {
  let sandbox: SinonSandbox;
  let sessionController: SessionController;
  let sessionService: SinonStubbedInstance<SessionService>;
  let redisService: SinonStubbedInstance<RedisService>;
  let configService: SinonStubbedInstance<ConfigService>;
  let pubSub: SinonStubbedInstance<PubSub>;

  beforeEach(async () => {
    sandbox = createSandbox();

    const ref: TestingModule = await Test.createTestingModule({
      controllers: [SessionController],
      providers: [
        {
          provide: SessionService,
          useValue: sandbox.createStubInstance(SessionService),
        },
        {
          provide: RedisService,
          useValue: sandbox.createStubInstance(RedisService),
        },
        {
          provide: ConfigService,
          useValue: sandbox.createStubInstance(ConfigService),
        },
        {
          provide: 'PUB_SUB',
          useValue: sandbox.createStubInstance(PubSub),
        },
      ],
    }).compile();

    sessionController = ref.get(SessionController);
    sessionService = ref.get(SessionService);
    redisService = ref.get(RedisService);
    configService = ref.get(ConfigService);
    pubSub = ref.get('PUB_SUB');
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should be instance', () => {
    expect(sessionController).toBeDefined();
    expect(sessionService).toBeDefined();
    expect(redisService).toBeDefined();
    expect(configService).toBeDefined();
  });

  it('should be method `session`',async  () => {
    sessionService.current.resolves({ status: Status.ACTIVE });
    await sessionController.session(1);
    expect(sessionService.current.calledOnce).toBeTruthy();
    expect(sessionService.current.calledOnce).toBeTruthy();
  });

  it('should be method `active`', async () => {
    await sessionController.active({ data: { id: 1 } });
    expect(configService.get.calledOnce).toBeTruthy();
    expect(redisService.set.calledOnce).toBeTruthy();
    expect(redisService.expire.calledOnce).toBeTruthy();
    expect(sessionService.change.calledOnce).toBeTruthy();
    expect(pubSub.publish.calledOnce).toBeTruthy();
  });

  it('should be method `inactive`', async () => {
    await sessionController.inactive({ data: { id: 1 } });
    expect(configService.get.calledOnce).toBeTruthy();
    expect(redisService.set.calledOnce).toBeTruthy();
    expect(redisService.expire.calledOnce).toBeTruthy();
    expect(sessionService.change.calledOnce).toBeTruthy();
    expect(pubSub.publish.calledOnce).toBeTruthy();
  });
});
