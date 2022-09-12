export default class User {
    login: string;
    level: number;
    avatar: any;
    friends: User[];
    status: string;
    rank: number;
    requestFriend: User[];
    constructor(name: string, avatar: any) {
        this.login = name;
        this.avatar = avatar;
        this.level = 0;
        this.friends = [];
        this.requestFriend = [];
        this.status = "offline";
        this.rank = 0;
    }
}
