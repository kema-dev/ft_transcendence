export class NewPrivMsg {
    user1: string;
    user2: string;
    message: string;
    date = Date();
    constructor(user1: string, user2: string, message: string) {
        this.user1 = user1;
        this.user2 = user2;
        this.message = message;
    }
}