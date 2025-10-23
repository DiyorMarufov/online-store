import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpStatus, ValidationPipe } from '@nestjs/common';
import config from 'src/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';

export default class Application {
  public static async main(): Promise<void> {
    const app = await NestFactory.create(AppModule);

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      }),
    );
    app.use(cookieParser());
    app.enableCors({ origin: '*' });

    const swaggerConfig = new DocumentBuilder()
      .setTitle('Online store example')
      .setDescription('The online store API description')
      .setVersion('1.0')
      .addTag('Online store')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token, example: Bearer <your_token>',
        },
        'access-token',
      )
      .build();
    app.setGlobalPrefix('api');
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api-docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });

    await app.listen(config.PORT, () =>
      console.log(`Server is running on port`, config.PORT),
    );
  }
}
