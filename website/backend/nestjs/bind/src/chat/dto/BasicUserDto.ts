export class BasicUserDto {
  avatar: any;
  login: string;
  constructor(login: string, avatar: any) {
    this.login = login;
    this.avatar = avatar;
  }
}