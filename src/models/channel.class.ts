import { User } from "./user.class";
import { Post } from "./post.class";


export class Channel {
    [x: string]: any;
    id!: string;
    chanName!: string;
    description!: string;
    creator!: User;
    users!: User[];
    posts!: Post[];


    constructor(obj?: any) {
        this.id = obj ? obj.id : '';
        this.chanName = obj ? obj.chanName : '';
        this.description = obj ? obj.description : '';
        this.creator = obj ? obj.creator : '';
        this.users = obj ? obj.users : [];
        this.posts = obj ? obj.posts : [];

    }




}