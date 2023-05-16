import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app/app.module';
import { ConfigService } from '@nestjs/config';
import { MicroserviceOptions } from '@nestjs/microservices';
import { RedisStrategy } from './redis/redis.strategy';

(async () => {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const configService = app.get<ConfigService>(ConfigService);
  const redisStrategy = app.get<RedisStrategy>(RedisStrategy);

  app.connectMicroservice<MicroserviceOptions>({
    strategy: redisStrategy,
  });

  app.startAllMicroservices();

  const port = configService.get('PORT');

  await app.listen(port || 3000);
})()
