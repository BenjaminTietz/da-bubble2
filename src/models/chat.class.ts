import { User } from "./user.class";
import { Message } from "./message.class";


export class Chat {
    [x: string]: any;
    id!: string;
    participants: User[] = [];
    chatStartedBy!: User;
    messages: Message[] = [];
    date!: string;
    time!: string;

    


    constructor(obj?: any) {
        this.id = obj ? obj.id : '';
        this.participants = obj ? obj.participants : [];
        this.chatStartedBy = obj ? obj.chatStartedBy : new User();
        this.messages = obj ? obj.messages : [];
        this.date = obj ? obj.date : '';
        this.time = obj ? obj.time : '';
    }





}