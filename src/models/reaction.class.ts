import { User } from "./user.class";


export class Reaction {
    [x: string]: any;
    id!: string;
    user!: User;
    emoji!: string;
    post_id!: string;
    answer_id!: string;
    amount!: number;





    constructor(obj?: any) {
        this.id = obj ? obj.id : '';
        this.user = obj ? obj.user : '';
        this.emoji = obj ? obj.emoji : '';
        this.post_id = obj ? obj.post_id : "";
        this.answer_id = obj ? obj.answer_id : "";
        this.amount = obj ? obj.amount : 0;
    }


}