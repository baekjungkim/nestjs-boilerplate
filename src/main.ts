import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { PrismaClient } from '@prisma/client';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import { rateLimit } from 'express-rate-limit';
import { writeFileSync } from 'fs';
import helmet from 'helmet';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger();

  // Prisma 연결 테스트
  const prisma = new PrismaClient();
  try {
    await prisma.$connect();
    logger.debug('Prisma 데이터베이스 연결 성공!');
  } catch (error) {
    logger.error('Prisma 데이터베이스 연결 실패:', error);
  }

  const app = await NestFactory.create(AppModule);

  // 글로벌 로깅 미들웨어 추가
  app.use((req, res, next) => {
    logger.log('Request:', {
      method: req.method,
      url: req.url,
      headers: req.headers,
    });
    next();
  });

  app.use(cookieParser()); // 쿠키 파서

  // Rate limiting 설정
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15분
      max: 100, // IP당 최대 요청 수
      message: 'Too many requests from this IP, please try again later.',
    }),
  );

  // CORS 설정
  app.enableCors({
    origin: ['http://localhost:3001', 'http://localhost:3000'], // 허용할 origin 추가
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'Origin',
      'X-Requested-With',
    ],
    exposedHeaders: ['Authorization'],
  });

  // Security 설정
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: {
        directives: {
          defaultSrc: [`'self'`],
          styleSrc: [`'self'`, `'unsafe-inline'`, 'https:'],
          imgSrc: [`'self'`, 'data:', 'https:'],
          scriptSrc: [`'self'`],
        },
      },
    }),
  );

  // ValidationPipe 설정
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // 정적 파일 제공을 위한 디렉토리 생성
  const publicPath = join(process.cwd(), 'public');
  app.use(express.static(publicPath));

  // Swagger 문서 설정
  const config = new DocumentBuilder()
    .setTitle('Clauvox API')
    .setDescription('The Clauvox API description')
    .setVersion('1.0')
    .addBearerAuth(
      {
        description: `JWT 액세스 토큰을 입력하세요`,
        name: 'Authorization',
        bearerFormat: 'JWT',
        scheme: 'Bearer',
        type: 'http',
        in: 'Header',
      },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // OpenAPI 스펙을 파일로 저장
  writeFileSync(
    join(publicPath, 'swagger-spec.json'),
    JSON.stringify(document),
  );

  // Swagger UI 설정
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      security: [{ Bearer: [] }],
    },
    customSiteTitle: 'Clauvox API Docs',
  });

  // ReDoc HTML 설정
  const redocHtml = `
<!DOCTYPE html>
<html>
  <head>
    <title>Clauvox API Documentation</title>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="https://fonts.googleapis.com/css?family=Montserrat:300,400,700|Roboto:300,400,700" rel="stylesheet">
    <style>
      body {
        margin: 0;
        padding: 0;
      }
    </style>
  </head>
  <body>
    <redoc spec-url="/swagger-spec.json"></redoc>
    <script src="https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js"></script>
  </body>
</html>`;

  app.use('/api-docs', (req, res) => {
    res.send(redocHtml);
  });

  await app.listen(3000);
  logger.debug('서버가 시작되었습니다: http://localhost:3000');
  logger.debug('Swagger UI: http://localhost:3000/api');
  logger.debug('ReDoc: http://localhost:3000/api-docs');
}
bootstrap();
