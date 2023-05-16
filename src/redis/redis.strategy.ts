import { Inject, Injectable } from '@nestjs/common';
import { Server, CustomTransportStrategy } from '@nestjs/microservices';
import Redis from 'ioredis';

export interface Options {
  host: string; 
  port: number;
}

export enum Handlers {
  KEY_EVENT_EXPIRED = 'KEY_EVENT_EXPIRED',
}

const keys = {
  '__keyevent@0__:expired': Handlers.KEY_EVENT_EXPIRED
}

@Injectable()
export class RedisStrategy extends Server implements CustomTransportStrategy {
  private client: Redis;

  constructor(
    @Inject('OPTIONS')
    private readonly options: Options,
  ) {
    super();
  }

  async listen(callback: () => void): Promise<void> {
    const host = this.options.host;
    const port = this.options.port;

    this.client = new Redis(port, host);

    this.client.config('SET', 'notify-keyspace-events', 'Ex');

    const handlers = this.getHandlers();

    handlers.forEach((value, key) => {
      this.client.subscribe(key);
    })

    this.client.subscribe('__keyevent@0__:expired');

    this.client.on('message', (...args) => {
      const handler = handlers.get(keys[args[0]]) || handlers.get(args[0]);
      handler
        ? handler(JSON.parse(args[1]))
        : this.logger.warn(`No handler registered for the "${args[0]}" event`);
    });

    callback();
  }

  async close(): Promise<void> {
    this.client.disconnect();
  }
}
