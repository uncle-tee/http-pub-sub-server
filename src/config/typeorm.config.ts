import { TypeOrmCoreModule } from '@nestjs/typeorm/dist/typeorm-core.module';
import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';

import * as config from 'config';

@Injectable()
export class TypeormConfig implements TypeOrmOptionsFactory {
  createTypeOrmOptions(
    connectionName?: string,
  ): Promise<TypeOrmModuleOptions> | TypeOrmModuleOptions {
    return {
      type: process.env.DB_TYPE || (config.get('db.type') as any),
      host: process.env.DB_HOST || config.get('db.host'),
      port: process.env.DB_PORT || (config.get('db.port') as any),
      database: process.env.DB_NAME || (config.get('db.name') as any),
      username: process.env.DB_USERNAME || config.get('db.username'),
      password: process.env.DB_PASSWORD || config.get('db.password'),
      dropSchema: process.env.DROP_SCHEMA || (config.get('db.drop_schema') as any) || false,
      logging:
        process.env.SHOW_LOG || (config.get('db.show_log') as any) || false,
      synchronize:
        process.env.TYPEORM_SYNC ||
        (config.get('db.synchronize') as any) ||
        false,
      entities: [__dirname + '/../domain/entities/*.entity{.js,.ts}'],
    };

  }
}