import User from '@/chat/objects/User';
import Message from "@/chat/objects/Message"
import BasicUser from '../dto/BasicUserDto';

export class PrivConv {
    user: BasicUser;
    messages: Message[];
    readed: boolean;
    id: number;
    n = 0;
    constructor(user: BasicUser, messages: Message[], readed: boolean, id: number) {
        this.user = user;
        this.messages = messages;
        this.readed = readed;
        this.id = id;
    }
}

