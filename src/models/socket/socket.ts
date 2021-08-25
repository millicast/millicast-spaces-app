import { io, Socket } from 'socket.io-client'
import { DefaultEventsMap } from 'socket.io-client/build/typed-events'
import UserModel from '../rooms/UserModel';
import ParticipantModel from '../rooms/ParticipantModel';
import ResultModel from '../common/ResultModel';
import RoomModel from '../rooms/RoomModel';
import TokenModel from '../common/TokenModel';
import ConfigModel from '../config/config';

class JoinModel
{
	tokens: TokenModel
	room: RoomModel
}

export default class SocketModel
{
	private static io: Socket<DefaultEventsMap, DefaultEventsMap>
	private static rooms: Map<string, RoomModel>;
	public static initialize(): void
	{
		SocketModel.io = io(ConfigModel.ServerURL, ConfigModel.ServerOptions)
		SocketModel.io.connect()

		SocketModel.io.on("room-created", (room: RoomModel) => {
			//Add room to list
			SocketModel.rooms.set(room.id, room);
			if (SocketModel.onRoomsUpdated != null)
				SocketModel.onRoomsUpdated(Array.from(SocketModel.rooms.values()))
		})

		SocketModel.io.on("room-deleted", (roomId: string) => {
			//Delete from from list
			SocketModel.rooms.delete(roomId);
			if (SocketModel.onRoomsUpdated != null)
				SocketModel.onRoomsUpdated(Array.from(SocketModel.rooms.values()))
		})

		SocketModel.io.on("user-joined", (roomId: string, participant: ParticipantModel) => {
			//Get room
			const room = SocketModel.rooms.get(roomId);
			//Add participant
			room.participants.set(participant.id,participant);
			if (SocketModel.onRoomUpdated != null)
				SocketModel.onRoomUpdated(room);
		})

		SocketModel.io.on("user-left", (roomId: string, userId: string) => {
			//Get room
			const room = SocketModel.rooms.get(roomId);
			//Remove participant
			room.speakers.delete(userId);
			room.participants.delete(userId);
			if (SocketModel.onRoomUpdated != null)
				SocketModel.onRoomUpdated(room);
		})
		

		SocketModel.io.on("user-raised-hand", (roomId: string, userId: string, raised: boolean) => {
			//Get room
			const room = SocketModel.rooms.get(roomId);
			//Get participant
			const participant = room.participants.get(userId);
			//Update raised hand flag
			participant.raisedHand = raised;

			if (SocketModel.onUserRaisedHand != null)
				SocketModel.onUserRaisedHand(room, participant);
			if (SocketModel.onRoomUpdated != null)
				SocketModel.onRoomUpdated(room);
		})

		SocketModel.io.on("user-promoted", (roomId: string, userId: string, promoted: boolean) => {
			//Get room
			const room = SocketModel.rooms.get(roomId);

			if (promoted)
				//Add to speakers
				room.speakers.add(userId);
			else
				//Remove from speakers
				room.speakers.add(userId);

			if (SocketModel.onRoomUpdated != null)
				SocketModel.onRoomUpdated(room);
		})

		SocketModel.io.on("user-muted", (roomId: string, userId: string, muted: boolean) => {
			//Get room
			const room = SocketModel.rooms.get(roomId);
			//Get participant
			const participant = room.participants.get(userId);
			//Update muted flag
			participant.muted = muted;

			if (SocketModel.onRoomUpdated != null)
				SocketModel.onRoomUpdated(room);
		})

		

		SocketModel.io.on('disconnect', function ()
		{
			if (SocketModel.onDisconnected != null)
				SocketModel.onDisconnected();
		});

		SocketModel.io.on('kicked', (roomId: string) =>
		{
			if (SocketModel.onKicked != null)
				SocketModel.onKicked(roomId);
		})

		SocketModel.io.on('muted', (roomId: string) =>
		{
			if (SocketModel.onMuted != null)
				SocketModel.onMuted(roomId);
		})

	}

	public static Authenticate(username: string): Promise<UserModel>
	{
		return new Promise<UserModel>((resolve, reject) => {
			SocketModel.io.emit('authenticate', username, (result: ResultModel<UserModel>) =>{
				if (result.Error.HasError)
					reject(new Error(result.Error.Message))
				else
					resolve(result.content)
			})
		})
	}

	public static GetRooms(): RoomModel[]
	{
		return Array.from(SocketModel.rooms.values());
	}

	public static CreateRoom(room: RoomModel): Promise<RoomModel>
	{
		return new Promise<RoomModel>((resolve, reject) => {
			SocketModel.io.emit('create-room', room.name, room.audioOnly, (result: ResultModel<RoomModel>) => {
				if (result.Error.HasError)
					reject(new Error(result.Error.Message))
				else
					resolve(result.content)
			})
		})
	}

	public static JoinRoom(roomId: string): Promise<JoinModel>
	{
		return new Promise<JoinModel>((resolve, reject) => {
			SocketModel.io.emit('join-room', roomId, (result: ResultModel<JoinModel>) => {
				if (result.Error.HasError)
					reject(new Error(result.Error.Message))
				else
					resolve(result.content)
			})
		})
	}

	public static RaiseHand(roomId: string, raised: boolean): Promise<void>
	{
		return new Promise<void>((resolve, reject) => {
			SocketModel.io.emit('raise-hand', roomId, raised, (result: ResultModel<void>) => {
				if (result.Error.HasError)
					reject(new Error(result.Error.Message))
				else
					resolve(result.content)
			})
		})
	}

	public static Mute(roomId: string, userId: string, muted: boolean): Promise<void>
	{
		return new Promise<void>((resolve, reject) => {
			SocketModel.io.emit('mute', roomId, muted, (result: ResultModel<void>) => {
				if (result.Error.HasError)
					reject(new Error(result.Error.Message))
				else
					resolve(result.content)
			})
		})
	}

	public static PromoteUser(roomId: string, userId: string, promote: boolean): Promise<void>
	{
		return new Promise<void>((resolve, reject) => {
			SocketModel.io.emit('promote-user', roomId, userId, promote, (result: ResultModel<void>) => {
				if (result.Error.HasError)
					reject(new Error(result.Error.Message))
				else
					resolve(result.content)
			})
		})
	}

	public static KickUser(roomId: string, userId: string): Promise<void>
	{
		return new Promise<void>((resolve, reject) => {
			SocketModel.io.emit('kick-user', roomId, userId, (result: ResultModel<void>) => {
				if (result.Error.HasError)
					reject(new Error(result.Error.Message))
				else
					resolve(result.content)
			})
		})
	}

	public static MuteSpeaker(roomId: string, userId: string): Promise<void>
	{
		return new Promise<void>((resolve, reject) =>
		{
			SocketModel.io.emit('mute-speaker', roomId, userId, (result: ResultModel<void>) => {
				if (result.Error.HasError)
					reject(new Error(result.Error.Message))
				else
					resolve(result.content)
			})
		})
	}

	public static onRoomsUpdated: (roomsList: RoomModel[]) => void
	public static onRoomUpdated: (room: RoomModel) => void
	public static onUserRaisedHand: (room: RoomModel, participant: ParticipantModel) => void

	public static onMuted: (roomId: string) => void
	public static onPromoted: (roomId: string, tokens: TokenModel) => void
	public static onDemoted: (roomId: string) => void
	public static onKicked: (roomId: string) => void
	public static onDisconnected: () => void
}
