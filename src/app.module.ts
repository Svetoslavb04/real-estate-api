import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { databaseConfig } from './config/database.config';
import { User } from './entities/user.entity';
import { Property } from './entities/property.entity';
import { Appointment } from './entities/appointment.entity';
import { PropertyFeature } from './entities/property-feature.entity';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { PropertiesModule } from './modules/properties/properties.module';
import envConfig from './config/env.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [envConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.database'),
        entities: databaseConfig.entities,
        synchronize:
          configService.get<string>('app.environment') !== 'production',
        logging: configService.get<string>('app.environment') === 'development',
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([User, Property, Appointment, PropertyFeature]),
    UsersModule,
    AuthModule,
    PropertiesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
