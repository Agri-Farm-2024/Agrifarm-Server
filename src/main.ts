import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { AllExceptionsFilter } from './common/filters/exception.filter';
import { ValidationPipe } from '@nestjs/common';
import * as morgan from 'morgan';
import { getDateWithoutTime, getTimeByPlusDays } from './utils/time.utl';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Config Swagger for development
  // if (process.env.NODE_ENV === 'development') {
  const config = new DocumentBuilder()
    .setTitle('NestJS API')
    .setVersion('0.0.1')
    .setDescription('The NestJS API description')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      in: 'header',
      name: 'Authorization',
      description: 'Enter your Bearer token',
    })
    .addSecurityRequirements('bearer')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  // }
  // Apply Interceptors Response
  app.useGlobalInterceptors(new ResponseInterceptor());
  // Apply Filter Exception
  app.useGlobalFilters(new AllExceptionsFilter());
  // / Enable global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      // Automatically remove properties that don't exist in the DTO
      whitelist: true,
      // Throw an error if any properties are not allowed in the DTO
      forbidNonWhitelisted: true,
      // Transform the input object to match the DTO type
      transform: true,
    }),
  );
  // Config cors
  app.enableCors({
    origin: '*', // Adjust according to your client URL
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  });
  // Config morgan
  const format_morgan: string = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
  app.use(morgan(format_morgan));
  // Run app
  await app.listen(process.env.HOST_PORT);
}
bootstrap();
