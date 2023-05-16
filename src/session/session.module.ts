import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { PubSub } from 'graphql-subscriptions';
import { PrismaService } from '../prisma/prisma.service';
import { JwtStrategy } from '../jwt/jwt.strategy';
import { RedisModule } from '../redis/redis.module';
import { SessionService } from './session.service';
import { SessionResolver } from './session.resolver';
import { SessionController } from './session.controller';

@Module({
  imports: [
    ConfigModule.forRoot(),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    RedisModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        const host = configService.get('REDIS_HOST');
        const port = configService.get('REDIS_PORT');
        return { host, port };
      },
      imports: [ConfigModule],
      inject: [ConfigService],
    }),
  ],
  controllers: [
    SessionController,
  ],
  providers: [
    SessionService,
    SessionResolver,
    PrismaService,
    JwtStrategy,
    {
      provide: 'PUB_SUB',
      useValue: new PubSub(),
    }
  ],
})
export class SessionModule {}
