export class NewChanDto {
  chanName: string;
  admin: string;
  priv: boolean;
  psw?: string;
  constructor(chanName: string, admin: string, priv: boolean, psw?: string) {
    this.chanName = chanName;
    this.admin = admin;
    this.priv = priv;
    this.psw = psw;
  }
}