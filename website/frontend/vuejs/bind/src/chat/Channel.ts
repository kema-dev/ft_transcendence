import User from '@/chat/User';
import Message from "@/chat/Message"

export default class Channel {
    name: string;
    admins: User[];
    users?: User[];
    messages?: Message[];
    psw?: string;
    bans?: User[];
    avatar: string;
    creation: Date;
    constructor(name: string, admins: User[], psw?: string, users?: User[], messages?: Message[]) {
        this.name = name;
        this.admins = admins;
        if (users) {
            this.users = users;
        }
        if (messages) {
            this.messages = messages;
        }
        if (psw) {
            this.psw = psw;
        }
        this.avatar = require("@/assets/group_logo.svg");
        this.creation = new Date();
    }
    addUser(user: User) {
        if (!this.users?.includes(user)) {
            this.users?.push(user);
        }
    }
    delUser(user: User) {
        // if (this.users?.includes(user)) {
        //     this.users?.push(user);
        // }
    }

}