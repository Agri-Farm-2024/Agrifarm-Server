import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Config Swagger
  const config = new DocumentBuilder()
    .setTitle('NestJS API')
    .setDescription('API description')
    .setVersion('1.0')
    .addTag('nestjs')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  // Config Logger
  await app.listen(process.env.HOST_PORT);
}
bootstrap();
