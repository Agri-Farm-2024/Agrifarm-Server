import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Config Swagger
  const config = new DocumentBuilder()
    .setTitle('NestJS API')
    .setDescription('API description')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Agri-Farm API Swagger For DEV')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  // Apply Interceptors Response
  app.useGlobalInterceptors(new ResponseInterceptor());
  // Apply Filter Exception
  // app.useGlobalFilters(new HttpExceptionFilter());
  await app.listen(process.env.HOST_PORT);
}
bootstrap();
