export class Emoji {
    [x: string]: any;
    id!: string;
    name: string;
    colons: string;
    text: string;
    emoticons: string[];
    skin: string;
    native: string;     //???  <---  typ?

    


    constructor(obj?: any) {
        this.id = obj ? obj.id : '';
        this.name = obj ? obj.name : '';
        this.colons = obj ? obj.colons : '';
        this.text = obj ? obj.text : '';
        this.emoticons = obj ? obj.emoticons : [];
        this.skin = obj ? obj.skin : '';
        this.native = obj ? obj.native : '';
    }

}
