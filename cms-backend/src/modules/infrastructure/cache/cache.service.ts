// src/modules/cache/cache.service.ts
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CacheService implements OnModuleInit {
  private client!: RedisClientType;
  private readonly logger = new Logger(CacheService.name);

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const host = this.configService.get<string>('REDIS_HOST') || 'redis';
    const port = parseInt(this.configService.get<string>('REDIS_PORT') || '6379', 10);
    const password = this.configService.get<string>('REDIS_PASSWORD') || undefined;

    this.client = createClient({
      socket: { host, port },
      password,
    });

    this.client.on('error', (err) => this.logger.error('Redis Client Error', err));

    try {
      await this.client.connect();
      this.logger.log(`Connected to Redis at ${host}:${port}`);
    } catch (err) {
      this.logger.error('Failed to connect to Redis', err);
      throw err;
    }
  }

  async set(key: string, value: any, ttlSeconds?: number) {
    const val = JSON.stringify(value);
    if (ttlSeconds) {
      await this.client.set(key, val, { EX: ttlSeconds });
    } else {
      await this.client.set(key, val);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    const val = await this.client.get(key);
    if (!val) return null;
    return JSON.parse(val) as T;
  }

  async del(key: string) {
    await this.client.del(key);
  }
}
