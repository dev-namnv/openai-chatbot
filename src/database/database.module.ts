import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import configuration from 'src/config/configuration';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: async () => ({
        uri: configuration().database,
        autoCreate: true,
      }),
    }),
  ],
})
export class DatabaseModule {}
