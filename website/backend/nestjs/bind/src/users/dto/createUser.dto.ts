export class CreateUserDto {
	email: string;
	login: string;
	password: string;
	ft_code: string;
	ft_accessToken: string;
	ft_tokenType: string;
	ft_expiresIn: number;
	ft_scope: string;
	ft_createdAt: Date;
}

export default CreateUserDto;
