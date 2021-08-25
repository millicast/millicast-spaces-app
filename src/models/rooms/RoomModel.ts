import ParticipantModel from '../rooms/ParticipantModel';
export default class RoomModel {
    public id: string
    public ownerId: string
    public name: string
    public audioOnly: boolean
    public speakers: Set<string>
    public participants: Map<string,ParticipantModel>

    constructor()
    {
        this.speakers = new Set<string>();
        this.participants = new Map<string,ParticipantModel>();
    }
}
