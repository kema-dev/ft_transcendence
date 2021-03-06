import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import User from './user.entity';
import CreateUserDto from './dto/createUser.dto';

// NOTE - API's documentation can be found at `docs/api/v1.md`

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(User)
		private usersRepository: Repository<User>,
	) {}

	async getByEmail(mail: string) {
		console.log('getByEmail: starting for ' + mail);
		const user = await this.usersRepository.findOne({
			where: { email: mail },
		});
		if (user) {
			console.log('getByEmail: found ' + mail + ', returning ✔');
			return user;
		}
		console.error('getByEmail: ' + mail + ' not found, returning ✘');
		throw new HttpException(
			'User with this email does not exist',
			HttpStatus.NOT_FOUND,
		);
	}

	async getByLogin(logname: string) {
		console.log('getByLogin: starting for ' + logname);
		const user = await this.usersRepository.findOne({
			where: { login: logname },
		});
		if (user) {
			console.log('getByLogin: found ' + logname + ', returning ✔');
			return user;
		}
		console.error('getByLogin: ' + logname + ' not found, returning ✘');
		throw new HttpException(
			'User with this login does not exist',
			HttpStatus.NOT_FOUND,
		);
	}

	async checkLoginExistence(login: string) {
		console.log('checkLoginExistence: starting for ' + login);
		const user = await this.usersRepository.findOne({
			where: { login: login },
		});
		if (user) {
			console.log('checkLoginExistence: found ' + login + ', returning ✔');
			return true;
		}
		console.error('checkLoginExistence: ' + login + ' not found, returning ✘');
		return false;
	}

	async getRank(login: string) {
		console.log('getRank: starting for ' + login);
		const user = await this.usersRepository.findOne({
			where: { login: login },
		});
		if (user) {
			console.log('getRank: found ' + login + ', returning ✔');
			return user.login;
		}
		console.error('getRank: ' + login + ' not found, returning ✘');
		// FIXME this return is unsafe
		return 'Not found';
	}

	async checkEmailExistence(email: string) {
		console.log('checkEmailExistence: starting for ' + email);
		const user = await this.usersRepository.findOne({
			where: { email: email },
		});
		if (user) {
			console.log('checkEmailExistence: found ' + email + ', returning ✔');
			return true;
		}
		console.error('checkEmailExistence: ' + email + ' not found, returning ✘');
		return false;
	}

	async checkCodeInUse(code: string): Promise<boolean> {
		console.log('checkCodeInUse: starting');
		const user = await this.usersRepository.findOne({
			where: { ft_code: code },
		});
		if (user) {
			console.log('checkCodeInUse: found, returning ✔');
			return true;
		}
		console.error('checkCodeInUse: not found, returning ✘');
		return false;
	}

	async getById(id: number) {
		console.log('getById: starting for ' + id);
		const user = await this.usersRepository.findOne({
			where: { id: id },
		});
		if (user) {
			console.log('getById: found ' + id + ', returning ✔');
			return user;
		}
		console.error('getById: ' + id + 'not found, returning ✘');
		throw new HttpException(
			'User with this id does not exist',
			HttpStatus.NOT_FOUND,
		);
	}

	async create(userData: CreateUserDto) {
		console.log('create: starting for ' + userData.login);
		const newUser = await this.usersRepository.create(userData);
		await this.usersRepository.save(newUser);
		console.log('create: created ' + userData.login + ', returning ✔');
		return newUser;
	}

	async ft_create(userData: CreateUserDto) {
		console.log('ft_create: starting for ' + userData.login);
		const newUser = await this.usersRepository.create(userData);
		await this.usersRepository.save(newUser);
		console.log('ft_create: created ' + userData.login + ', returning ✔');
		return newUser;
	}

	async ft_update(
		email: string,
		ft_accessToken: string,
		ft_expiresIn: number,
		ft_createdAt: Date,
	) {
		console.log('ft_update: starting for ' + email);
		const user = await this.usersRepository.findOne({
			where: { email: email },
		});
		if (user) {
			console.log('ft_update: found ' + email + ', updating ✔');
			user.ft_accessToken = ft_accessToken;
			user.ft_expiresIn = ft_expiresIn;
			user.ft_createdAt = ft_createdAt;
			await this.usersRepository.save(user);
		}
		console.error('ft_update: ' + email + ' not found, updating aborted ✘');
	}
}
