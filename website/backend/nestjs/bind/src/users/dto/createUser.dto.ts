export class CreateUserDto {
	public constructor(params: Partial<CreateUserDto>) {
		this.email = '';
		this.login = '';
		this.level = 0;
		this.password = '';
		this.ft_code = '';
		this.ft_accessToken = '';
		this.ft_tokenType = '';
		this.ft_expiresIn = 0;
		this.ft_refreshToken = '';
		this.ft_scope = '';
		this.ft_createdAt = new Date();
		this.totp_code = '';
		this.session_token = '';
		Object.assign(this, params);
	}
	email: string;
	login: string;
	level: number;
	password: string;
	ft_code: string;
	ft_accessToken: string;
	ft_tokenType: string;
	ft_expiresIn: number;
	ft_refreshToken: string;
	ft_scope: string;
	ft_createdAt: Date;
	totp_code: string;
	session_token: string;
}

export default CreateUserDto;
