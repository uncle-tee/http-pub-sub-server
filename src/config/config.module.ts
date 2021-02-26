import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as config from 'config';
import { TypeormConfig } from './typeorm.config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useExisting: TypeormConfig,
    }),
  ],
  exports: [TypeOrmModule, TypeormConfig],
  providers: [TypeormConfig],
})
export class ConfigModule {
}
