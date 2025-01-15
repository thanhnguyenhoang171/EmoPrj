import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    ConfigModule.forRoot(
      { isGlobal: true, }
    ),
    MongooseModule.forRoot('mongodb+srv://2151013087thanh:Thanh123258789*@emoprj.x8swa.mongodb.net/?retryWrites=true&w=majority&appName=EmoPrj'),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
