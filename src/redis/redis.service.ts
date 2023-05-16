import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { Options } from './redis.strategy';

@Injectable()
export class RedisService {
  private client: Redis;

  constructor(
    @Inject('OPTIONS')
    private readonly options: Options,
  ) {
    const host = this.options.host;
    const port = this.options.port;

    this.client = new Redis(port, host);
  }

  async emit<T>(key: string, data: T): Promise<void> {
    await this.client.publish(key, JSON.stringify({ data }));
  }

  async set<T>(key: string | number, data: T): Promise<void> {
    const name = key.toString();
    await this.client.set(name, JSON.stringify(data));
  }

  async expire(key: string | number, expire: number): Promise<void> {
    const name = key.toString();
    await this.client.expire(name, expire);
  }

  async get<T>(key: string | number): Promise<T> {
    const name = key.toString();
    const data = await this.client.get(name);
    return data ? JSON.parse(data) : null;
  }
}
