export class NewChanDto {
  chanName: string;
  priv: boolean;
  psw?: string;
  constructor(chanName: string, priv: boolean, psw?: string) {
    this.chanName = chanName;
    this.priv = priv;
    this.psw = psw;
  }
}