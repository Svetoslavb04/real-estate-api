import { Config } from './configuration.interface';

export default (): Config => {
  return {
    database: {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT ?? '5432', 10),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_DATABASE || 'real_estate_db',
    },
    jwt: {
      secret:
        process.env.JWT_SECRET || 'your-super-secret-key-change-in-production',
      expiresIn: process.env.JWT_EXPIRATION || '1d',
    },
    app: {
      port: parseInt(process.env.PORT ?? '3000', 10),
      environment: process.env.NODE_ENV || 'development',
    },
  };
};
