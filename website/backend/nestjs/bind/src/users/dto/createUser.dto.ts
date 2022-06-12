export class CreateUserDto {
	email: string;
	name: string;
	password: string;
	ft_code: string;
	ft_accessToken: string;
	ft_tokenType: string;
	ft_expiresIn: number;
	ft_refreshToken: string;
	ft_scope: string;
	ft_createdAt: Date;
}

export default CreateUserDto;
