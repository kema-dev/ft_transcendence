import { MessageDto } from "@/chat/dto/MessageDto"
import { BasicUserDto } from "@/chat/dto/BasicUserDto";

export class PrivConvDto {
    user: BasicUserDto;
    messages: MessageDto[];
    readed: boolean;
    id: number;
    n = 0;
    constructor(user: BasicUserDto, messages: MessageDto[], readed: boolean, id: number) {
        this.user = user;
        this.messages = messages;
        this.readed = readed;
        this.id = id;
    }
}

