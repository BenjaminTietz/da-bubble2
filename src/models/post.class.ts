import { User } from "./user.class";
import { Channel } from "./channel.class";
import { Answer } from "./answer.class";
import { Reaction } from "./reaction.class";


export class Post {
    [x: string]: any;
    id!: string;
    content!: string;
    channel!: Channel;
    user!: User;
    date!: string;
    time!: string;
    answers!: Answer[];
    reactions!: Reaction[];




    constructor(obj?: any) {
        this.id = obj ? obj.id : '';
        this.content = obj ? obj.content : '';
        this.channel = obj ? obj.channel : '';
        this.user = obj ? obj.user : '';
        this.date = obj ? obj.date : '';
        this.time = obj ? obj.time : '';
        this.answers = obj ? obj.answers : [];
        this.reactions = obj ? obj.reactions : [];
        
    }


    


}