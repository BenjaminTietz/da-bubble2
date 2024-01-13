import { User } from "./user.class";


export class Reaction {
    [x: string]: any;
    id!: string;
    user!: User;
    emoji!: string;





    constructor(obj?: any) {
        this.id = obj ? obj.id : '';
        this.user = obj ? obj.user : '';
        this.emoji = obj ? obj.emoji : '';



    }


}