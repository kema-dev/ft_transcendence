export class NewChanDto {
  chanName: string;
  admin: string;
  psw: string | undefined;
  constructor(chanName: string, admin: string, psw: string | undefined) {
    this.chanName = chanName;
    this.admin = admin;
    this.psw = psw;
  }
}