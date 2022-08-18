import User from '@/chat/User';
import Message from "@/chat/Message"

export default class Channel {
    
    // channel: boolean;
    channel: boolean;
    users: User[];
    messages?: Message[];
    name: string;
    constructor(channel: boolean, users: User[], messages?: Message[], name?: string) {
        this.channel = channel;
        this.users = users;
        if (messages) {
            this.messages = messages;
        }
        if (name) {
            this.name = name;
        }
        else {
            let namejoin = "";
            for (let i = 0; i < users.length; i++) {
                namejoin += users[i].name;
                if (i != users.length - 1) {
                    namejoin += ", ";
                }
            }
            this.name = namejoin;
        }
    }
}