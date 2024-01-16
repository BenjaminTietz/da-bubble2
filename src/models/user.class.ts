import { Channel } from "./channel.class";


export class User {
    [x: string]: any;
    id!: string;
    authUID!: string;
    name!: string;
    status: boolean = false;
    avatarURL!: string;
    photoURL!: string;
    channels: Channel[] = [];
    email!: string;




    constructor(obj?: any) {
        this.id = obj ? obj.id : '';
        this.authUID = obj ? obj.authUID : '';
        this.name = obj ? obj.name : '';
        this.status = obj ? obj.status : false;
        this.avatarURL = obj ? obj.avatarURL : '';
        this.photoURL = obj ? obj.photoURL : '';
        this.channels = obj ? obj.channels : [];
        this.email = obj ? obj.email : '';

    }

}