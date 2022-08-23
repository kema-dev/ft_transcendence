import User from "./User";

export class Message {
    user: User;
    msg: string;
    date: Date;
    constructor(user: User, msg: string, date: Date) {
        this.user = user;
        this.msg = msg;
        this.date = date;
    }
}
