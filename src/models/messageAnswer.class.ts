import { User } from "./user.class";
import { Reaction } from "./reaction.class";


export class MessageAnswer {
    [x: string]: any;
    id!: number;
    text!: string;
    messageId!: string;
    user!: User;
    date!: string;
    time!: string;
    reactions!: Reaction[];


    constructor(obj?: any) {
        this.id = obj && obj.id !== undefined ? obj.id : null;
        this.text = obj && obj.text !== undefined ? obj.text : '';
        this.messageId = obj && obj.messageId !== undefined ? obj.messageId : '';
        this.user = obj && obj.user !== undefined ? obj.user : null;
        this.date = obj && obj.date !== undefined ? obj.date : '';
        this.time = obj && obj.time !== undefined ? obj.time : '';
        this.reactions = obj && obj.reactions !== undefined ? obj.reactions : [];
    }

}