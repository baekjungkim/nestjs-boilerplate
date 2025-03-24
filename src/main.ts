import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { PrismaClient } from '@prisma/client';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import { rateLimit } from 'express-rate-limit';
import helmet from 'helmet';
import { join } from 'path';
import { AppModule } from './app.module';
import { ResponseTransformInterceptor } from './common/Interceptors/response-transform.interceptor';
import { CustomException } from './common/exceptions/custom.exception';
import { HttpExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const logger = new Logger();

  // ✅ Prisma 연결 확인
  const prisma = new PrismaClient();
  try {
    await prisma.$connect();
    logger.debug('✅ Prisma 데이터베이스 연결 성공!');
  } catch (error) {
    logger.error('❌ Prisma 데이터베이스 연결 실패:', error);
  }

  const app = await NestFactory.create(AppModule);

  // ✅ 기본 미들웨어
  app.use(cookieParser());
  app.use(express.static(join(process.cwd(), 'public')));
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      message: 'Too many requests from this IP, please try again later.',
    }),
  );

  // ✅ 글로벌 예외 처리
  app.useGlobalFilters(new HttpExceptionsFilter());

  // ✅ 응답 형식 변환
  const reflector = app.get(Reflector); // Reflector 주입
  app.useGlobalInterceptors(new ResponseTransformInterceptor(reflector));

  // ✅ CORS 설정
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
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

  // ✅ Helmet 보안 설정
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: false, // 필요 시 커스터마이징 가능
    }),
  );

  // ✅ 글로벌 ValidationPipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      exceptionFactory: (errors) => {
        const messageKey = Object.values(errors[0].constraints)[0];
        return new CustomException(messageKey, 400);
      },
    }),
  );

  // ✅ Swagger 문서 설정
  const swaggerConfig = new DocumentBuilder()
    .setTitle('NestJS Boilerplate API')
    .setDescription('The NestJS Boilerplate API description')
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

  const document = SwaggerModule.createDocument(app, swaggerConfig);

  // ✅ Swagger UI: http://localhost:3000/api
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      security: [{ Bearer: [] }],
    },
    customSiteTitle: 'NestJS Boilerplate API Docs',
  });

  // ✅ Swagger JSON: http://localhost:3000/api-docs
  app.getHttpAdapter().get('/api-docs', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(document);
  });

  // ✅ ReDoc UI: http://localhost:3000/docs
  app.getHttpAdapter().get('/docs', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>NestJS Boilerplate API Docs</title>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <style> body { margin: 0; padding: 0; } </style>
        </head>
        <body>
          <redoc spec-url="/api-docs"></redoc>
          <script src="https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js"></script>
        </body>
      </html>
    `);
  });

  const port = 3000;
  await app.listen(port);
  logger.debug(`🚀 서버가 시작되었습니다: http://localhost:${port}`);
  logger.debug(`📘 Swagger UI: http://localhost:${port}/api`);
  logger.debug(`📄 Swagger JSON: http://localhost:${port}/api-docs`);
  logger.debug(`📕 ReDoc UI: http://localhost:${port}/docs`);
}
bootstrap();
