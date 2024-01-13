
import { User } from "./user.class";
import { Chat } from "./chat.class";
import { Reaction } from "./reaction.class";



export class Message {
    [x: string]: any;
    id!: number;
    text!: string;
    chatId!: string;
    user!: User;
    reactions!: Reaction[];



    constructor(obj?: any) {
        this.id = obj ? obj.id : '';
        this.text = obj ? obj.name : '';
        this.chatId = obj ? obj.chat : '';
        this.user = obj ? obj.user : '';
        this.reactions = obj ? obj.reactions : [];

    }

}

