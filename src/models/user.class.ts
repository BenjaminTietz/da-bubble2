import { Channel } from "./channel.class";


export class User {
    [x: string]: any;
    id!: string;
    authUID!: string;
    name!: string;
    status!: string;
    photoURL!: string;
    channels: Channel[] = [];
    



    constructor(obj?: any) {
        this.id = obj ? obj.id : '';
        this.authUID = obj ? obj.authUID : '';
        this.name = obj ? obj.name : '';
        this.status = obj ? obj.status : '';
        this.photoURL = obj ? obj.photoURL : '';
        this.channels = obj ? obj.channels : [];


    }

}