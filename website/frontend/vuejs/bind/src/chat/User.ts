export default class User {
    login: string;
    level: number;
    avatar: any;
    friends: User[];
    status: boolean;
    rank: number
    constructor(name: string, avatar: any) {
        this.login = name;
        this.avatar = avatar;
        this.level = 0;
        this.friends = [];
        this.status = false;
        this.rank = 0;
    }
}
