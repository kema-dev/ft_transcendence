export default class BasicUser {
  // avatar: any;
  // login: string;
  // constructor(avatar: any, login: string) {
    //     this.avatar = avatar;
    //     this.login = login;
    // }
    
  avatar: string = require("@/assets/avatars/(1).jpg");
  login: string;
  constructor(login: string) {
      this.login = login;
  }
}