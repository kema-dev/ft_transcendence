import User from '@/chat/objects/User';
import Message from "@/chat/objects/Message"

export default class Channel {
    name: string;
    admins: User[];
    users: User[];
    messages: Message[];
    psw?: string;
    bans: User[] = [];
    avatar: string = require("@/assets/group_logo.svg");
    creation: Date = new Date();
    constructor(name: string, admins: User[], psw?: string, users: User[] = [], messages: Message[] = []) {
        this.name = name;
        this.admins = admins;
        this.users = users;
        this.messages = messages;
        if (psw) {
            this.psw = psw;
        }
    }
    isAdmin(user: User) : boolean {
        if (this.admins.includes(user)) {
            return true;
        } else {
            return false;
        }
    }
    isBan(user: User) : boolean {
        if (this.bans.includes(user)) {
            return true;
        } else {
            return false;
        }
    }
    isUser(user: User) : boolean {
        if (this.users.includes(user)) {
            return true;
        } else {
            return false;
        }
    }
    addUser(user: User) {
        if (!this.users?.includes(user)) {
            this.users?.push(user);
        }
    }
    addBan(toBan: User, admin: User) {
        if (this.isAdmin(admin)) {
            this.bans?.push(toBan);
        } else { 
            console.log("This user is not admin, he can't ban a user");
        }
    }
    delUser(user: User) {
        // if (this.users?.includes(user)) {
        //     this.users?.push(user);
        // }
    }
    numberOfUser() : number {
        return this.admins.length + this.users.length;
    }

}