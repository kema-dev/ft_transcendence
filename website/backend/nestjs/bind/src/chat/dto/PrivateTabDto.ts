export default class PrivateTabDto {
    // avatar: any;
    // login: string;
    // message: Message;
    // date: Date;
    // constructor(login: string, message: Message, date: Date, avatar: any){
    //     this.login = login;
    //     this.message = message;
    //     this.date = date;
    //     this.avatar = avatar;
    // }

    // avatar : any = require("../../users/avatars/(6).jpg");
    login: string;
    message: string;
    date: Date;
    lastMsgUser: string;
    readed: boolean;
    constructor(login: string, message: string,
        date: Date, lastMsgUser: string, readed: boolean){
        this.login = login;
        this.message = message;
        this.date = date;
        this.lastMsgUser = lastMsgUser;
        this.readed = readed;
    }
}