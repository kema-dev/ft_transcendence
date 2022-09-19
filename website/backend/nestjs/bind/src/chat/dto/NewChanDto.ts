export class NewChanDto {
  chanName: string;
  admin: string;
  psw: string;
  constructor(chanName: string, admin: string, psw?: string) {
    this.chanName = chanName;
    this.admin = admin;
    if (psw)
      this.psw = psw;
  }
}