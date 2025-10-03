import { Injectable, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit {
  private client!: Redis;

  onModuleInit() {
    const host = process.env.REDIS_HOST;
    const port = process.env.REDIS_PORT;
    const password = process.env.REDIS_PASSWORD;

    if (!host || !port || !password) {
      throw new Error('REDIS_HOST, REDIS_PORT o REDIS_PASSWORD no definidos');
    }

    this.client = new Redis({
      host,
      port: parseInt(port),
      password,
    });
  }

  getClient() {
    return this.client;
  }

  async set(key: string, value: any, ttlSeconds?: number) {
    if (ttlSeconds) {
      await this.client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } else {
      await this.client.set(key, JSON.stringify(value));
    }
  }

  async get(key: string) {
    const val = await this.client.get(key);
    return val ? JSON.parse(val) : null;
  }

  async del(key: string) {
    await this.client.del(key);
  }

  async sadd(key: string, value: string) {
    await this.client.sadd(key, value);
  }

  async srem(key: string, value: string) {
    await this.client.srem(key, value);
  }

  async smembers(key: string) {
    return this.client.smembers(key);
  }
}
