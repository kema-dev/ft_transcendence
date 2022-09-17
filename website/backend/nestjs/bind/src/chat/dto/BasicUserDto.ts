export class BasicUserDto {
  // avatar: any;
  // login: string;
  // constructor(avatar: any, login: string) {
  //       this.avatar = avatar;
  //       this.login = login;
  //   }
    
  avatar: any = "@/assets/avatars/(1).jpg";
  login: string;
  constructor(login: string) {
    this.login = login;
  }
  // constructor(data: any) {
      // for (let key in data) {
      //   this[key] = data[key];
      // }
  // }
}