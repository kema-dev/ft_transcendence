export class CreateUserDto {
	email: string;
	login: string;
	password: string;
	ft_code: string;
	ft_accessToken: string;
	ft_tokenType: string;
	ft_expiresIn: number;
	ft_refreshToken: string;
	ft_scope: string;
	ft_createdAt: Date;
	totp_code: string;
}

export default CreateUserDto;
