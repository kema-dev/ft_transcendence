import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import * as fs from 'fs';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
	const httpsOptions = {
		key: fs.readFileSync('/secrets/key.pem'),
		cert: fs.readFileSync('/secrets/cert.pem'),
	};
	const app = await NestFactory.create<NestExpressApplication>(AppModule, { httpsOptions });
	app.useStaticAssets(join(__dirname, '..', 'public'), {
		index: false,
		prefix: '/public',
	});
	app.setGlobalPrefix('api/v1');
	app.use(cookieParser());
	app.enableCors();
	await app.listen(3000);
}
bootstrap();
