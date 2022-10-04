import { MessageDto } from './MessageDto';
import { BasicUserDto } from './BasicUserDto';

export class ChannelDto {
    name: string;
    avatar: string = require("@/assets/group_logo.svg");
    creation: Date = new Date();
    admins: BasicUserDto[];
    priv: boolean;
    psw?: string;
    users: BasicUserDto[];
    messages: MessageDto[];
    bans: BasicUserDto[];
    mutes: BasicUserDto[];
    readed: boolean;
    constructor(
        name: string, 
        avatar: any,
        creation: Date,
        admins: BasicUserDto[],
        priv: boolean,
        psw?: string,
        users: BasicUserDto[] = [], 
        messages: MessageDto[] = [],
        bans: BasicUserDto[] = [], 
        mutes: BasicUserDto[] = [], 
        readed = false, 
    ) {
        this.name = name;
        this.avatar = avatar;
        this.creation = creation;
        this.admins = admins;
        this.priv = priv;
        if (psw) {
            this.psw = psw;
        }
        this.users = users;
        this.messages = messages;
        this.bans = bans;
        this.mutes = mutes;
        this.readed = readed;
    }
}