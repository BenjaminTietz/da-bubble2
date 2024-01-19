import { User } from "./user.class";
import { Reaction } from "./reaction.class";


export class MessageAnswer {
    [x: string]: any;
    id!: number;
    text!: string;
    messageId!: string;
    user!: User;
    reactions!: Reaction[];


    constructor(obj?: any) {
        this.id = obj ? obj.id : '';
        this.text = obj ? obj.name : '';
        this.messageId = obj ? obj.messageId : '';
        this.user = obj ? obj.user : '';
        this.reactions = obj ? obj.reactions : [];

    }

}