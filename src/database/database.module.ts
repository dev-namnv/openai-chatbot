import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import enviroment from 'src/config/enviroment';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: async () => ({
        uri: enviroment().database,
        autoCreate: true,
      }),
    }),
  ],
})
export class DatabaseModule {}
