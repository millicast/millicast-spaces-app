import UserModel from './UserModel';
export default class ParticipantModel extends UserModel {
    public raisedHand: boolean
    public muted: boolean
    public multiplexedId: string
    public audioLevel: any
}
