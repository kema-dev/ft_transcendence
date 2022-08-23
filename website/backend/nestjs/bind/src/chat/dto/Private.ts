import User from './User';
import { Message } from "./Message"

export default class Private {
    user: User;
    messages: Message[];
    constructor(user: User, messages: Message[]) {
        this.user = user;
        this.messages = messages;
    }
}