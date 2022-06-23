import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import User from './user.entity';
import CreateUserDto from './dto/createUser.dto';

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(User)
		private usersRepository: Repository<User>,
	) {}

	async getByEmail(email: string) {
		const user = await this.usersRepository.findOne({ email });
		if (user) {
			return user;
		}
		throw new HttpException(
			'User with this email does not exist',
			HttpStatus.NOT_FOUND,
		);
	}

	async checkLoginExistence(login: string) {
		const user = await this.usersRepository.findOne({ login });
		if (user) {
			return true;
		}
		return false;
	}

	async getRank(login: string) {
		const user = await this.usersRepository.findOne({ login });
		if (user) {
			return user.login;
		}
		return 'Not found';
	}

	async checkEmailExistence(email: string) {
		const user = await this.usersRepository.findOne({ email });
		if (user) {
			return true;
		}
		return false;
	}

	async checkCodeInUse(code: string): Promise<boolean> {
		const user = await this.usersRepository.findOne({ ft_code: code });
		if (user) {
			return true;
		}
		return false;
	}

	async getById(id: number) {
		const user = await this.usersRepository.findOne({ id });
		if (user) {
			return user;
		}
		throw new HttpException(
			'User with this id does not exist',
			HttpStatus.NOT_FOUND,
		);
	}

	async create(userData: CreateUserDto) {
		const newUser = await this.usersRepository.create(userData);
		await this.usersRepository.save(newUser);
		return newUser;
	}

	async ft_create(userData: CreateUserDto) {
		const newUser = await this.usersRepository.create(userData);
		await this.usersRepository.save(newUser);
		return newUser;
	}

	async ft_update(
		email: string,
		ft_accessToken: string,
		ft_expiresIn: number,
		ft_createdAt: Date,
	) {
		const user = await this.usersRepository.findOne({ email });
		if (user) {
			user.ft_accessToken = ft_accessToken;
			user.ft_expiresIn = ft_expiresIn;
			user.ft_createdAt = ft_createdAt;
			await this.usersRepository.save(user);
		}
	}
}
