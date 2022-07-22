import User from '@/chat/User';
import Message from "@/chat/Message"

export default class Conversation {
    
    channel: boolean;
    users?: User[];
    user?: User;
    messages: Message[];
    constructor(channel: boolean, messages: Message[],
        users?: User[], user?: User) {
        this.channel = channel;
        if (users) {
            this.users = users;
        }
        else if (user){
            this.user = user;
        }
        this.messages = messages;
    }
}