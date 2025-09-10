import { CacheModule } from '@nestjs/cache-manager';
import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { join } from 'path';
import { timeout } from 'src/common/timeout';
import configuration from 'src/config/enviroment';
import { DatabaseModule } from 'src/database';
import { HttpErrorFilter } from 'src/shared/httpError.filter';
import { TimeoutMiddleware } from 'src/shared/timeout.middleware';
import { TransformInterceptor } from 'src/shared/transform.interceptor';
import { LoggerModule } from '../common/logger';
import { AccountModule } from './account/account.module';
import { ApiKeyModule } from './apikey/apikey.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ChatbotModule } from './chatbot/chatbot.module';
import { PineconeModule } from './pinecone/pinecone.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      load: [configuration],
      isGlobal: true,
    }),
    DatabaseModule,
    ServeStaticModule.forRoot({
      renderPath: '/',
      rootPath: join(__dirname, '..', '../client/build'),
    }),
    ServeStaticModule.forRoot({
      renderPath: '/assets',
      rootPath: join(__dirname, '..', '../client/build/assets'),
    }),
    CacheModule.register({
      ttl: timeout.halfAnHour,
      max: 100,
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: timeout.oneSecond,
        limit: 3,
      },
      {
        name: 'medium',
        ttl: timeout.tenSeconds,
        limit: 20,
      },
      {
        name: 'long',
        ttl: timeout.oneMinute,
        limit: 60,
      },
    ]),
    LoggerModule,
    AccountModule,
    AuthModule,
    ChatbotModule,
    PineconeModule,
    ApiKeyModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    JwtService,
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: HttpErrorFilter,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TimeoutMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
