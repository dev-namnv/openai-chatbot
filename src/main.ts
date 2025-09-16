import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import basicAuth from 'express-basic-auth';
import enviroment from './config/enviroment';
import { AppModule } from './modules/app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.use(
    ['/api-docs'],
    basicAuth({
      users: { admin: 'admin' },
      challenge: true,
    }),
  );
  const config = enviroment();
  const options = new DocumentBuilder()
    .setTitle('API Documents')
    .setVersion('1.0.0')
    .addServer('/api/v1')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'JWT',
    )
    .setDescription('Chatbot APIs')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api-docs', app, document);

  app.enableCors({
    origin: ['http://localhost:5173', 'https://ai-chatbot-ccdd1.web.app'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix('api/v1');
  await app.listen(config.port, '0.0.0.0');
  const appURL = await app.getUrl();

  Logger.log(`Server is running on: ${appURL}`, 'Bootstrap');
  Logger.log(`API docs: ${appURL}/api-docs/`, 'API Docs');
}
bootstrap();
