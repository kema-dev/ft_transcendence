export class Message {
  user: string;
  msg: string;
  date: Date;
  constructor(user: string, msg: string, date: Date) {
      this.user = user;
      this.msg = msg;
      this.date = date;
  }
}

export class PrivateConvDto {
  avatar: any = require("@/assets/avatars/(1).jpg");
  user: string;
  msgs: Message[];
  constructor(user: string, msgs: Message[]) {
      this.user = user;
      this.msgs = msgs;
  }
}