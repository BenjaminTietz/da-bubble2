import { User } from "./user.class";
import { Message } from "./message.class";


export class Chat {
    [x: string]: any;
    id!: string;
    user!: User[];
    messages!: Message[];

    


    constructor(obj?: any) {
        this.id = obj ? obj.id : '';
        this.user = obj ? obj.user : [];
        this.messages = obj ? obj.messages : []

    }





}