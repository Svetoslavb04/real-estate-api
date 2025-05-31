import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Property } from '../entities/property.entity';
import { Appointment } from '../entities/appointment.entity';
import { ConfigService } from '@nestjs/config';
import { DatabaseConfig } from './configuration.interface';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  const dbConfig = configService.get<DatabaseConfig>('database', {
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'postgres',
    database: 'real_estate_db',
  });
  const environment = configService.get<string>(
    'app.environment',
    'development',
  );

  return {
    type: 'postgres',
    host: dbConfig.host,
    port: dbConfig.port,
    username: dbConfig.username,
    password: dbConfig.password,
    database: dbConfig.database,
    entities: [User, Property, Appointment],
    synchronize: environment !== 'production',
    logging: environment === 'development',
  };
};
