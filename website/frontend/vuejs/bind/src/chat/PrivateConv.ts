import User from '@/chat/User';
import Message from "@/chat/Message"

export default class PrivateConv {
    user: User;
    messages: Message[];
    constructor(user: User, messages: Message[]) {
        this.user = user;
        this.messages = messages;
    }
}