import { User } from "./user.class";
import { Channel } from "./channel.class";
import { Answer } from "./answer.class";
import { Reaction } from "./reaction.class";


export class Post {
    [x: string]: any;
    id!: string;
    content!: string;
    channelId!: string;
    user!: User;
    date!: string;
    lastAnswer!: string;
    answers!: number;
    reactions!: Reaction[];




    constructor(obj?: any) {
        this.id = obj ? obj.id : '';
        this.content = obj ? obj.content : '';
        this.channelId = obj ? obj.channelId : '';
        this.user = obj ? obj.user : '';
        this.date = obj ? obj.date : '';
        this.lastAnswer = obj ? obj.lastAnswer : '';
        this.answers = obj ? obj.answers : 0;
        this.reactions = obj ? obj.reactions : [];

    }





}