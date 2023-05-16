import { Test } from '@nestjs/testing';
import { createSandbox, SinonSandbox, SinonStubbedInstance, SinonStub } from 'sinon';
import { PrismaService } from '../prisma/prisma.service';
import { SessionService } from './session.service';
import { Status } from '@prisma/client';

describe('SessionService', () => {
  let sandbox: SinonSandbox;
  let sessionService: SessionService;
  let prismaService: SinonStubbedInstance<PrismaService>;

  let findUnique: SinonStub;
  let update: SinonStub;

  beforeEach(async () => {
    sandbox = createSandbox();
    findUnique = sandbox.stub();
    update = sandbox.stub();

    const ref = await Test.createTestingModule({
      providers: [
        {
          provide: PrismaService,
          useValue: { user: { findUnique, update } },
        },
      ],
    }).compile();
  
    prismaService = ref.get(PrismaService);
    sessionService = new SessionService(prismaService);
  });

  it('should be method `current`', async () => {
    await sessionService.current(1);
    expect(findUnique.calledOnce).toBeTruthy();
  });

  it('should be method `change`', async () => {
    await sessionService.change(1, Status.ACTIVE);
    expect(update.calledOnce).toBeTruthy();
  });
});
