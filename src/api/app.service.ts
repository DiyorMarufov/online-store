import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpStatus, ValidationPipe } from '@nestjs/common';
import config from 'src/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export default class Application {
  public static async main(): Promise<void> {
    let app = await NestFactory.create(AppModule);
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      }),
    );

    const swaggerConfig = new DocumentBuilder()
      .setTitle('Online store example')
      .setDescription('The online store API description')
      .setVersion('1.0')
      .addTag('Online store')
      .build();
    const documentFactory = () =>
      SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api', app, documentFactory);

    await app.listen(config.PORT, () =>
      console.log(`Server is running on port`, config.PORT),
    );
  }
}
