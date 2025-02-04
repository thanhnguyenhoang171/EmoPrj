import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { softDeletePlugin } from 'soft-delete-plugin-mongoose';
import { Connection } from 'mongoose';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { RolesModule } from './roles/roles.module';
import { PermissionsModule } from './permissions/permissions.module';
import { DatabasesModule } from './databases/databases.module';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
        connectionFactory: (connection) => {
          connection.plugin(softDeletePlugin);
          return connection;
        },
        onConnectionCreate: (connection: Connection) => {
          connection.on('connected', () => console.log('Databasse is connected'));
          connection.on('open', () => console.log('Databasse is open'));
          connection.on('disconnected', () => console.log('Databasse is disconnected'));
          connection.on('reconnected', () => console.log('Databasse is reconnected'));
          connection.on('disconnecting', () => console.log('Databasse is disconnecting'));
          
          return connection;
        },
      }),
      inject: [ConfigService],
    }),
    ConfigModule.forRoot({
      isGlobal: true
    }),
    UsersModule,
    AuthModule,
    RolesModule,
    PermissionsModule,
    DatabasesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
