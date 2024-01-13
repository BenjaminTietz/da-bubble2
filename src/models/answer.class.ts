import { Post } from "./post.class";
import { Reaction } from "./reaction.class";
import { User } from "./user.class";


export class Answer {

    [x: string]: any;
    id!: string;
    content!: string;
    user!: User;
    post!: Post;
    date!: string;
    time!: string;
    reactions!: Reaction[];




    constructor(obj?: any) {
        this.id = obj ? obj.id : '';
        this.content = obj ? obj.content : '';
        this.user = obj ? obj.user : '';
        this.post = obj ? obj.post : '';
        this.date = obj ? obj.date : '';
        this.time = obj ? obj.time : '';
        this.reactions = obj ? obj.reactions : [];

    }





}