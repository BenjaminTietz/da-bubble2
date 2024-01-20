
import { User } from "./user.class";
import { Reaction } from "./reaction.class";
import { MessageAnswer } from "./messageAnswer.class";



export class Message {
    [x: string]: any;
    id!: string;
    text!: string;
    chatId!: string;
    user!: User;
    messageAnwser!: MessageAnswer[];
    reactions!: Reaction[];



    constructor(obj?: any) {
        this.id = obj ? obj.id : '';
        this.text = obj ? obj.name : '';
        this.chatId = obj ? obj.chat : '';
        this.user = obj ? obj.user : '';
        this.messageAnwser = obj ? obj.messageAnwser : [];
        this.reactions = obj ? obj.reactions : [];

    }

}

