import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { UserEntity } from './user.entity';
import CreateUserDto from './dto/createUser.dto';
import ResumUserDto from 'src/users/dto/ResumUserDto';
import ProfileUserDto from 'src/users/dto/ProfileUserDto';
import { avatars } from 'src/users/avatars';

// NOTE - API's documentation can be found at `docs/api/v1.md`

@Injectable()
export class UsersService {
	private logger: Logger = new Logger('UsersService');
	constructor(
		@InjectRepository(UserEntity)
		private usersRepository: Repository<UserEntity>,
	) {}

	async saveSocket(login: string, socket: string) {
		const user = await this.getByLogin(login);
		user.socketId = socket;
		await this.usersRepository
			.save(user)
			.catch((e) => console.log('Save saveSocket error'));
	}

	async saveLobby(login: string, lobby_name: string) {
		const user = await this.getByLogin(login);
		user.lobby_name = lobby_name;
		await this.usersRepository
			.save(user)
			.catch((e) => console.log('Save saveSocket error'));
	}

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
		throw new HttpException('E_USER_NOT_FOUND', HttpStatus.NOT_FOUND);
	}

	async getByLogin(logname: string, relations?: any) {
		console.log('getByLogin: starting for ' + logname);
		let params;
		if (relations) params = { where: { login: logname }, relations: relations };
		else params = { where: { login: logname } };
		const user = await this.usersRepository.findOne(params);
		if (user) {
			console.log('getByLogin: found ' + logname + ', returning ✔');
			return user;
		}
		console.error('getByLogin: ' + logname + ' not found, returning ✘');
		throw new HttpException('E_USER_NOT_FOUND', HttpStatus.NOT_FOUND);
	}

	async getByLoginFiltred(filter: string) {
		const maxUsers = 20;
		console.log("getByLoginFiltred: starting for '" + filter + "'");
		const users = await this.usersRepository.find({
			where: { login: Like(filter + '%') },
			take: maxUsers,
		});
		return users;
	}

	// async getAnyByLogin(name: string, infos: [string]) {
	// 	console.log('getAnyByLogin: starting for ' + name);
	// 	for (let i = 0; i < infos.length; ++i)
	// 		infos[i] = ("user." + infos[i]);
	// 	return await this.usersRepository
	// 		.createQueryBuilder()
	// 		.select(infos)
	// 		.from(User, "user")
	// 		.where("user.login = :login", { login: name })
	// 		.getOne();
	// }

	async getByAny(name: string) {
		console.log('getByAny: starting for ' + name);
		let user = await this.usersRepository.findOne({
			where: { login: name },
		});
		if (user) {
			console.log('getByAny: found ' + name + ' as login, returning ✔');
			return user;
		}
		user = await this.usersRepository.findOne({
			where: { email: name },
		});
		if (user) {
			console.log('getByAny: found ' + name + ' as email, returning ✔');
			return user;
		}
		console.error('getByAny: ' + name + ' not found, returning ✘');
		throw new HttpException('E_USER_NOT_FOUND', HttpStatus.NOT_FOUND);
	}

	async sendFriendRequest(sender: string, receiver: string, server: any) {
		const userReceiver = await this.getByLogin(receiver, {
			requestFriend: true,
			friends: true,
		});
		const userSender = await this.getByLogin(sender, {
			requestFriend: true,
			friends: true,
		});
		if (userReceiver.login == userSender.login) return;
		if (!userReceiver.requestFriend) userReceiver.requestFriend = [];
		if (userReceiver.requestFriend.find((user) => user.login == sender)) return;
		userReceiver.requestFriend.push(userSender);
		// this.usersRepository.createQueryBuilder().relation(UserEntity, "requestFriend").of(userReceiver).add(userSender);
		this.usersRepository
			.save(userReceiver)
			.catch((e) => this.logger.log('Save user error'));
		server
			.to(userReceiver.socketId)
			.emit('userUpdate', new ProfileUserDto(userReceiver));
		// server.to(userReceiver.socketId).emit('friendRequest', new ResumUserDto(userSender));
	}
	async declineFriendRequest(sender: string, receiver: string, server: any) {
		const userSender = await this.getByLogin(sender, {
			requestFriend: true,
			friends: true,
		});
		if (!userSender.requestFriend) userSender.requestFriend = [];
		userSender.requestFriend = userSender.requestFriend.filter(
			(user) => user.login != receiver,
		);
		this.usersRepository
			.save([userSender])
			.catch((e) => this.logger.log('Save user error'));
		server
			.to(userSender.socketId)
			.emit('userUpdate', new ProfileUserDto(userSender));
	}
	async addFriend(sender: string, receiver: string, server: any) {
		const userSender = await this.getByLogin(sender, {
			requestFriend: true,
			friends: true,
		});
		const userReceiver = await this.getByLogin(receiver, {
			requestFriend: true,
			friends: true,
		});
		if (!userSender.friends) userSender.friends = [];
		if (!userReceiver.friends) userReceiver.friends = [];
		userSender.friends.push(userReceiver);
		userReceiver.friends.push(userSender);
		if (!userSender.requestFriend) userSender.requestFriend = [];
		userSender.requestFriend = userSender.requestFriend.filter(
			(user) => user.login != receiver,
		);
		if (!userReceiver.requestFriend) userReceiver.requestFriend = [];
		userReceiver.requestFriend = userReceiver.requestFriend.filter(
			(user) => user.login != sender,
		);
		// userSender.requestFriend.filter(user => user.login != receiver);
		this.usersRepository.save([userReceiver, userSender]);
		server
			.to(userSender.socketId)
			.emit('userUpdate', new ProfileUserDto(userSender));
		server
			.to(userReceiver.socketId)
			.emit('userUpdate', new ProfileUserDto(userReceiver));
		// server.to(userReceiver.socketId).emit('friendAccepted', new ResumUserDto(userSender));
		// server.to(userSender.socketId).emit('friendAccepted', new ResumUserDto(userReceiver));
		// server.to(userSender.socketId).emit('removeFriendRequest', new ResumUserDto(userReceiver));
	}
	async removeFriend(sender: string, receiver: string, server: any) {
		const userSender = await this.getByLogin(sender, {
			requestFriend: true,
			friends: true,
		});
		const userReceiver = await this.getByLogin(receiver, {
			requestFriend: true,
			friends: true,
		});
		if (!userSender.friends) userSender.friends = [];
		if (!userReceiver.friends) userReceiver.friends = [];
		userSender.friends = userSender.friends.filter(
			(user) => user.login != receiver,
		);
		userReceiver.friends = userReceiver.friends.filter(
			(user) => user.login != sender,
		);
		this.usersRepository.save([userReceiver, userSender]);
		server
			.to(userSender.socketId)
			.emit('userUpdate', new ProfileUserDto(userSender));
		server
			.to(userReceiver.socketId)
			.emit('userUpdate', new ProfileUserDto(userReceiver));
	}
	async changeAvatar(login: string, avatar: string) {
		const user = await this.getByLogin(login);
		user.avatar = avatar;
		this.usersRepository.save(user);
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
		// FIXME this return is unsafe, use a proper exception instead
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
		throw new HttpException('E_USER_NOT_FOUND', HttpStatus.NOT_FOUND);
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
		} else {
			console.error('ft_update: ' + email + ' not found, updating aborted ✘');
		}
	}

	async update_session(login: string, cookie: string) {
		console.log('update_session: starting for ' + login);
		const user = await this.getByAny(login);
		if (user) {
			console.log('update_session: found ' + login + ', updating ✔');
			user.session_token = cookie;
			user.session_expiration = new Date(new Date().getTime() + 3600000 * 24);
			await this.usersRepository.save(user);
		} else {
			console.error(
				'update_session: ' + login + ' not found, updating aborted ✘',
			);
			throw new HttpException('E_USER_NOT_FOUND', HttpStatus.NOT_FOUND);
		}
	}

	async change_totp_code(user: UserEntity, totp_code: string) {
		console.log('change_totp_code: starting for ' + user.email);
		console.log(
			'change_totp_code: ' + user.email + ', updating and returning ✔',
		);
		user.totp_code = totp_code;
		await this.usersRepository.save(user);
	}

	async change_tmp_totp_code(user: UserEntity, totp_code: string) {
		console.log('change_tmp_totp_code: starting for ' + user.email);
		console.log(
			'change_tmp_totp_code: ' + user.email + ', updating and returning ✔',
		);
		user.tmp_totp_code = totp_code;
		await this.usersRepository.save(user);
	}

	async validate_totp(user: string) {
		console.log('validate_totp: starting for ' + user);
		const usr = await this.getByAny(user);
		const buf = usr.tmp_totp_code;
		usr.tmp_totp_code = '';
		usr.totp_code = buf;
		await this.usersRepository.save(usr);
		console.log('validate_totp: ' + user + ', returning ✔');
	}

	async assign_match_to_user(user: string, match: number) {
		console.log('assign_match_to_user: starting for', user, 'and match', match);
		const usr = await this.getByAny(user);
		usr.match.push(match);
		this.usersRepository.save(usr);
		console.log('assign_match_to_user: ' + user + ', returning ✔');
	}

	async get_user_avatar(user: string) {
		console.log('get_user_avatar: starting for', user);
		if (user == 'search') {
			console.log('get_user_avatar: search, returning ✔');
			return avatars[5];
		}
		const usr = await this.getByAny(user);
		console.log('get_user_avatar: ' + user + ', returning ✔');
		return usr.avatar;
	}
}
