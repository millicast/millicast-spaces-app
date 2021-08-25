import LoginModel from '../login/LoginModel';
export default class RoomModel {
    public id: string
    public ownerId: string
    public name: string
    public audioOnly: boolean
    public speakers: LoginModel[]
    public members: LoginModel[]

    constructor()
    {
        this.speakers = [];
        this.members = [];
    }
}
