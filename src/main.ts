import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { AllExceptionsFilter } from './common/filters/exception.filter';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Config Swagger for development
  // if (process.env.NODE_ENV === 'development') {
  const config = new DocumentBuilder()
    .setTitle('NestJS API')
    .setDescription('API description')
    .setVersion('1.0')
    .addGlobalParameters(
      {
        name: 'Authorization',
        description: 'Access token',
        required: false,
        in: 'header',
        schema: {
          type: 'string',
        },
      },
      {
        name: 'refresh',
        description: 'Refresh token',
        required: false,
        in: 'header',
        schema: {
          type: 'string',
        },
      },
    )
    .addTag('Agri-Farm API Swagger For DEV')
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
  // Run app
  await app.listen(process.env.HOST_PORT);
}
bootstrap();
