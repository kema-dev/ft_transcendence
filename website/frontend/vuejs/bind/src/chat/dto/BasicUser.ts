export default class BasicUser {
  avatar: string = require("@/assets/avatars/(1).jpg");
  login: string;
  // constructor(avatar: string, login: string) {
  //     this.avatar = avatar;
  //     this.login = login;
  // }
  constructor(login: string) {
      this.login = login;
  }
}