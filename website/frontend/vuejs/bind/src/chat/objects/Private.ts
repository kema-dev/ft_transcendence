import User from '@/chat/objects/User';
import Message from "@/chat/objects/Message"

export default class Private {
    user: User;
    messages: Message[];
    constructor(user: User, messages: Message[]) {
        this.user = user;
        this.messages = messages;
    }
}