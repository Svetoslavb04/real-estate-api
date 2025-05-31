import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { DatabaseConfig } from './configuration.interface';

const getTestDatabaseConfig = (): TypeOrmModuleOptions => ({
  type: 'better-sqlite3',
  database: ':memory:',
  dropSchema: true,
  autoLoadEntities: true,
  synchronize: true,
  logging: false,
});

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  const environment = configService.get<string>(
    'app.environment',
    'development',
  );

  if (environment === 'test') {
    return getTestDatabaseConfig();
  }

  const dbConfig = configService.get<DatabaseConfig>('database', {
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'postgres',
    database: 'real_estate_db',
  });

  return {
    type: 'postgres',
    host: dbConfig.host,
    port: dbConfig.port,
    username: dbConfig.username,
    password: dbConfig.password,
    database: dbConfig.database,
    autoLoadEntities: true,
    synchronize: environment !== 'production',
    logging: environment === 'development',
  };
};
