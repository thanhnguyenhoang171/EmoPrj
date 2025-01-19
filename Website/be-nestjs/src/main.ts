import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import {TransformInterceptor } from './core/transform.interceptor'

async function bootstrap() {

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // config Gloval Pipes
  app.useGlobalPipes(new ValidationPipe());

  // Config configService
  const configService = app.get(ConfigService);

  // Config version
  app.setGlobalPrefix("api")
  app.enableVersioning(
    {
      type: VersioningType.URI,
      defaultVersion: ['1']
    }
  );

  // Config host, port
  const port = configService.get<string>('PORT') || 3001;
  const host = configService.get<string>('HOST')

  // Config extract metadata with reflector
  const reflector = app.get(Reflector)

  // Config custom response message with interceptor
  app.useGlobalInterceptors(new TransformInterceptor(reflector))

  // Start application
  await app.listen(port, host);
  console.log(`Application is running on: http://${host}:${port}, Port: ${port}`);
}
bootstrap();
