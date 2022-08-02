import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import * as fs from 'fs';

async function bootstrap() {
	const httpsOptions = {
		key: fs.readFileSync('/secrets/key.pem'),
		cert: fs.readFileSync('/secrets/cert.pem'),
	};
	const app = await NestFactory.create(AppModule, {
		httpsOptions,
	});
	app.setGlobalPrefix('api/v1');
	app.use(cookieParser());
	app.enableCors();
	await app.listen(3000);
}
bootstrap();
