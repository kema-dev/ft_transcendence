// import User from '@/chat/objects/User';
import { MessageDto } from "./MessageDto"
import { BasicUserDto } from "./BasicUserDto";

export class ChannelDto {
    name: string;
    avatar: string; // = require("@/assets/group_logo.svg");
    creation: Date = new Date();
    admins: BasicUserDto[];
    psw?: string;
    users: BasicUserDto[];
    messages: MessageDto[];
    bans: BasicUserDto[] = [];
    mutes: BasicUserDto[] = [];
    readed: boolean;
    // constructor(name: string, admins: BasicUserDto[], readed = false, users: BasicUserDto[] = [], psw?: string, messages: MessageDto[] = []) {
    //     this.name = name;
    //     this.admins = admins;
    //     this.readed = readed;
    //     this.users = users;
    //     this.messages = messages;
    //     if (psw) {
    //         this.psw = psw;
    //     }
    // }
    constructor(
        name: string, 
        avatar: any,
        creation: Date,
        admins: BasicUserDto[], 
        psw?: string,
        users: BasicUserDto[] = [], 
        messages: MessageDto[] = [],
        bans: BasicUserDto[] = [], 
        mutes: BasicUserDto[] = [], 
        readed = false, 
    ) {}

    // isAdmin(user: BasicUserDto) : boolean {
    //     if (this.admins.includes(user)) {
    //         return true;
    //     } else {
    //         return false;
    //     }
    // }
    // isBan(user: BasicUserDto) : boolean {
    //     if (this.bans.includes(user)) {
    //         return true;
    //     } else {
    //         return false;
    //     }
    // }
    // isUser(user: BasicUserDto) : boolean {
    //     if (this.users.includes(user)) {
    //         return true;
    //     } else {
    //         return false;
    //     }
    // }
    // addUser(user: BasicUserDto) {
    //     if (!this.users?.includes(user)) {
    //         this.users?.push(user);
    //     }
    // }
    // addBan(toBan: BasicUserDto, admin: BasicUserDto) {
    //     if (this.isAdmin(admin)) {
    //         this.bans?.push(toBan);
    //     } else { 
    //         console.log("This user is not admin, he can't ban a user");
    //     }
    // }
    // delUser(user: BasicUserDto) {
    //     // if (this.users?.includes(user)) {
    //     //     this.users?.push(user);
    //     // }
    // }
    // numberOfUser() : number {
    //     return this.admins.length + this.users.length;
    // }
    // printMsgs() {
    //     this.messages.forEach((msg) => console.log(`${msg.msg}`));
    // }

}