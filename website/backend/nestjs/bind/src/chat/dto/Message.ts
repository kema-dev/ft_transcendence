export default class Message {
    user: string;
    msg: string;
    date: Date;
    constructor(user: string, msg: string, date: Date) {
        this.user = user;
        this.msg = msg;
        this.date = date;
    }
}
