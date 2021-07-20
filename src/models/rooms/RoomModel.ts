import LoginModel from '../login/LoginModel';
export default class RoomModel {
    public Id: string
    public OwnerId: string
    public name: string
    public onlySound: boolean
    public speakers: LoginModel[]
    public members: LoginModel[]

    constructor()
    {
        this.speakers = [];
        this.members = [];
    }
}
