import ParticipantModel from '../rooms/ParticipantModel';

export default class RoomModel
{
	public id: string
	public ownerId: string
	public name: string
	public audioOnly: boolean
	public speakers: Record<string, boolean>
	public participants: Record<string, ParticipantModel>

	constructor()
	{
		this.speakers = {};
		this.participants = {};
	}

	static fromJson(room: any): RoomModel
	{
		const model = new RoomModel();
		model.id = room.id;
		model.ownerId = room.ownerId;
		model.name = room.name;
		model.audioOnly = room.audioOnly;
		for (let speakerId of room.speakers)
			model.speakers[speakerId] = true;
		for (let participant of room.participants)
			model.participants[participant.id] = participant;
		return model
	}
}
