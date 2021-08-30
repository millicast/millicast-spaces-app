import { io, Socket } from "socket.io-client"
import { DefaultEventsMap } from "socket.io-client/build/typed-events"
import UserModel from "../rooms/UserModel";
import ParticipantModel from "../rooms/ParticipantModel";
import RoomModel from "../rooms/RoomModel";
import TokenModel from "../rooms/TokenModel";
import ConfigModel from "../config/config";
import { reactive } from "vue";

class ResultModel<T> {
	error: string
	data: T
}

class AuthenticationModel
{
	user: UserModel
	rooms: RoomModel[]
}

//Privat room map
const rooms: Map<string, RoomModel> = reactive<Map<string, RoomModel>>(new Map<string, RoomModel>());

export default class SocketModel
{
	private static io: Socket<DefaultEventsMap, DefaultEventsMap>
	public static initialize(): void
	{
		//Clear rooms
		rooms.clear();

		SocketModel.io = io(ConfigModel.ServerURL, ConfigModel.ServerOptions);
		SocketModel.io.connect();

		SocketModel.io.on("room-created", (room: any) =>
		{
			console.log(`Room created ${room.id}`);
			//Add room to list
			rooms.set(room.id, reactive<RoomModel>(RoomModel.fromJson(room)));
		})

		SocketModel.io.on("room-deleted", (roomId: string) =>
		{
			console.log(`Room deleted ${roomId}`);
			//Delete from from list
			rooms.delete(roomId);
		})

		SocketModel.io.on("user-joined", (roomId: string, participant: ParticipantModel) =>
		{
			console.log(`User ${participant.id}  ${participant.username} joined ${roomId}`);
			//Get room
			const room = rooms.get(roomId);
			//Add participantd
			room.participants[participant.id] = reactive<ParticipantModel>(participant);
		})

		SocketModel.io.on("user-left", (roomId: string, userId: string) =>
		{
			console.log(`User ${userId} left ${roomId}`);
			//Get room
			const room = rooms.get(roomId);
			//Remove participant
			delete (room.speakers[userId]);
			delete (room.participants[userId]);
		})

		SocketModel.io.on("user-raised-hand", (roomId: string, userId: string, raised: boolean) =>
		{
			console.log(`User ${userId} raised hand in ${roomId}`);
			//Get room
			const room = rooms.get(roomId);
			//Get participant
			const participant = room.participants[userId];
			//Update raised hand flag
			participant.raisedHand = raised;

			if (SocketModel.onUserRaisedHand != null)
				SocketModel.onUserRaisedHand(roomId, participant);
		})

		SocketModel.io.on("user-promoted", (roomId: string, userId: string, promoted: boolean) =>
		{
			console.log(`User ${userId} promoted:${promoted} in ${roomId}`);
			//Get room
			const room = rooms.get(roomId);
			//Get participant
			const participant = room.participants[userId];
			//Remove raised hand flag
			participant.raisedHand = false;
			if (promoted)
			{
				//Add to speakers
				room.speakers[userId] = true;
				//Not muted
				participant.muted = false;
			} else
				//Remove from speakers
				delete (room.speakers[userId]);
		})

		SocketModel.io.on("user-muted", (roomId: string, userId: string, muted: boolean) =>
		{
			console.log(`User ${userId} muted in ${roomId}`);
			//Get room
			const room = rooms.get(roomId);
			//Get participant
			const participant = room.participants[userId];
			//Update muted flag
			participant.muted = muted;
		})

		SocketModel.io.on("disconnect", function ()
		{
			console.log("You have disconnected from server");
			//Clear rooms
			rooms.clear();
			if (SocketModel.onDisconnected != null)
				SocketModel.onDisconnected();
		});

		SocketModel.io.on("kicked", (roomId: string) =>
		{
			console.log(`You have been kicked from ${roomId}`);
			if (SocketModel.onKicked != null)
				SocketModel.onKicked(roomId);
		})

		SocketModel.io.on("muted", (roomId: string) =>
		{
			console.log(`You have been muted in ${roomId}`);
			if (SocketModel.onMuted != null)
				SocketModel.onMuted(roomId);
		})

		SocketModel.io.on("promoted", (roomId: string, tokens: TokenModel) =>
		{
			console.log(`You have been promoted in ${roomId}`);
			if (SocketModel.onPromoted != null)
				SocketModel.onPromoted(roomId, tokens);
		})

		SocketModel.io.on("demoted", (roomId: string) =>
		{
			console.log(`You have been demoted in ${roomId}`);
			if (SocketModel.onDemoted != null)
				SocketModel.onDemoted(roomId);
		})
	}

	public static Authenticate(username: string): Promise<UserModel>
	{
		return new Promise<UserModel>((resolve, reject) =>
		{
			SocketModel.io.emit("authenticate", username, (result: ResultModel<AuthenticationModel>) =>
			{
				if (result.error)
					return reject(new Error(result.error))
				rooms.clear();
				for (const room of result.data.rooms)
					rooms.set(room.id,RoomModel.fromJson(room));
				resolve(result.data.user)
			})
		})
	}

	public static GetRooms(): Map<string,RoomModel>
	{
		return rooms;
	}

	public static GetRoom(roomId: string): RoomModel
	{
		return rooms.get(roomId);
	}

	public static CreateRoom(room: RoomModel): Promise<string>
	{
		return new Promise<string>((resolve, reject) =>
		{
			SocketModel.io.emit("create-room", room.name, room.audioOnly, (result: ResultModel<string>) =>
			{
				if (result.error)
					reject(new Error(result.error))
				else
					resolve(result.data)
			})
		})
	}

	public static JoinRoom(roomId: string): Promise<TokenModel>
	{
		return new Promise<TokenModel>((resolve, reject) =>
		{
			SocketModel.io.emit("join-room", roomId, (result: ResultModel<TokenModel>) =>
			{
				if (result.error)
					reject(new Error(result.error))
				else
					resolve(result.data)
			})
		})
	}

	public static LeaveRoom(roomId: string): Promise<void>
	{
		return new Promise<void>((resolve, reject) =>
		{
			SocketModel.io.emit("leave-room", roomId, (result: ResultModel<void>) =>
			{
				if (result.error)
					reject(new Error(result.error))
				else
					resolve()
			})
		})
	}

	public static RaiseHand(roomId: string, raised: boolean): Promise<void>
	{
		return new Promise<void>((resolve, reject) =>
		{
			SocketModel.io.emit("raise-hand", roomId, raised, (result: ResultModel<void>) =>
			{
				if (result.error)
					reject(new Error(result.error))
				else
					resolve(result.data)
			})
		})
	}

	public static Mute(roomId: string, userId: string, muted: boolean): Promise<void>
	{
		return new Promise<void>((resolve, reject) =>
		{
			SocketModel.io.emit("mute", roomId, muted, (result: ResultModel<void>) =>
			{
				if (result.error)
					reject(new Error(result.error))
				else
					resolve(result.data)
			})
		})
	}

	public static PromoteUser(roomId: string, userId: string, promote: boolean): Promise<void>
	{
		return new Promise<void>((resolve, reject) =>
		{
			SocketModel.io.emit("promote-user", roomId, userId, promote, (result: ResultModel<void>) =>
			{
				if (result.error)
					reject(new Error(result.error))
				else
					resolve(result.data)
			})
		})
	}

	public static KickUser(roomId: string, userId: string): Promise<void>
	{
		return new Promise<void>((resolve, reject) =>
		{
			SocketModel.io.emit("kick-user", roomId, userId, (result: ResultModel<void>) =>
			{
				if (result.error)
					reject(new Error(result.error))
				else
					resolve(result.data)
			})
		})
	}

	public static MuteSpeaker(roomId: string, userId: string): Promise<void>
	{
		return new Promise<void>((resolve, reject) =>
		{
			SocketModel.io.emit("mute-speaker", roomId, userId, (result: ResultModel<void>) =>
			{
				if (result.error)
					reject(new Error(result.error))
				else
					resolve(result.data)
			})
		})
	}

	public static onUserRaisedHand: (roomId: string, participant: ParticipantModel) => void

	public static onMuted: (roomId: string) => void
	public static onPromoted: (roomId: string, tokens: TokenModel) => void
	public static onDemoted: (roomId: string) => void
	public static onKicked: (roomId: string) => void
	public static onDisconnected: () => void
}


