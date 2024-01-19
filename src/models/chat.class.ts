import { User } from "./user.class";
import { Message } from "./message.class";


export class Chat {
    [x: string]: any;
    id!: string;
    participants!: User[];
    messages!: Message[];

    


    constructor(obj?: any) {
        this.id = obj ? obj.id : '';
        this.participants! = obj ? obj.participants : [];
        this.messages = obj ? obj.messages : []

    }





}