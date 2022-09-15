export class NewChanMsgDto {
  userSend: string;
  chanName: string;
  message: string;
  date = new Date();
  constructor(userSend: string, chanName: string, message: string) {
      this.userSend = userSend;
      this.chanName = chanName;
      this.message = message;
  }
}