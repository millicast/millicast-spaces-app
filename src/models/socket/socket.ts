import { io, Socket } from 'socket.io-client'
import { DefaultEventsMap } from 'socket.io-client/build/typed-events'
import LoginModel from '../login/LoginModel';
import ResultModel from '../common/ResultModel';
import RoomModel from '../rooms/RoomModel';
import TokenModel from '../common/TokenModel';

class JoinModel
{
    tokens: TokenModel
    room: RoomModel
}

export default class SocketModel {
    private static io: Socket<DefaultEventsMap, DefaultEventsMap>
    public static initialize(): void {
        SocketModel.io = io('https://millicastserver.fontventa.com')
        SocketModel.io.connect()

        SocketModel.io.on("rooms-list", (roomList: RoomModel[]) => {
            if (SocketModel.callbackUpdateRooms != null) {
                SocketModel.callbackUpdateRooms(roomList)
            }
        })

        SocketModel.io.on("rooms-form", (room: RoomModel) => {
            if (SocketModel.callbackUpdateRoom != null) {
                SocketModel.callbackUpdateRoom(room)
            }
        })

        SocketModel.io.on("room-requests-list", (room: RoomModel) => {
            if (SocketModel.callbackUpdateRoomRequests != null) {
                SocketModel.callbackUpdateRoomRequests(room)
            }
        })

        SocketModel.io.on("room-requests-modal", (room: RoomModel) => {
            if (SocketModel.callbackUpdateRequestsModal != null) {
                SocketModel.callbackUpdateRequestsModal(room)
            }
        })

        SocketModel.io.on("user-promoted", (roomId: string, tokens: TokenModel) => {
            if (SocketModel.callbackUserPromoted != null) {
                SocketModel.callbackUserPromoted(roomId, tokens);
            }
        })

        SocketModel.io.on("user-demoted", (roomId: string) => {
            if (SocketModel.callbackUserDemoted != null) {
                SocketModel.callbackUserDemoted(roomId);
            }
        })
    }

    //#region LOGIN

    public static Authenticate(username: string): Promise<LoginModel> {
        return new Promise<LoginModel>((resolve, reject) => {
            SocketModel.io.emit('authenticate', username, (result: ResultModel<LoginModel>) => {
                if (result.Error.HasError) {
                    reject(new Error(result.Error.Message))
                } else {
                    resolve(result.content)
                }
            })
        })
    }

    //#endregion


    //#region ROOMS

    public static GetRooms(): Promise<RoomModel[]> {
        return new Promise<RoomModel[]>((resolve, reject) => {
            SocketModel.io.emit('get-rooms', (result: ResultModel<RoomModel[]>) => {
                if (result.Error.HasError) {
                    reject(new Error(result.Error.Message))
                } else {
                    resolve(result.content)
                }
            })
        })
    }

    public static GetRoomById(roomId: string): Promise<RoomModel> {
        return new Promise<RoomModel>((resolve, reject) => {
            SocketModel.io.emit('get-room-by-id', roomId, (result: ResultModel<RoomModel>) => {
                if (result.Error.HasError) {
                    reject(new Error(result.Error.Message))
                } else {
                    resolve(result.content)
                }
            })
        })
    }

    public static GetRoomUser(roomId: string): Promise<LoginModel> {
        return new Promise<LoginModel>((resolve, reject) => {
            SocketModel.io.emit('get-room-user', roomId, (result: ResultModel<LoginModel>) => {
                if (result.Error.HasError) {
                    reject(new Error(result.Error.Message))
                } else {
                    resolve(result.content)
                }
            })
        })
    }

    public static CreateRoom(room: RoomModel): Promise<RoomModel> {
        return new Promise<RoomModel>((resolve, reject) => {
            SocketModel.io.emit('create-room', room.name, room.onlySound, (result: ResultModel<RoomModel>) => {
                if (result.Error.HasError) {
                    reject(new Error(result.Error.Message))
                } else {
                    resolve(result.content)
                }
            })
        })
    }

    public static ExitRooms(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            SocketModel.io.emit('exit-rooms', (result: ResultModel<void>) => {
                if (result.Error.HasError) {
                    reject(new Error(result.Error.Message))
                } else {
                    resolve(result.content)
                }
            })
        })
    }

    public static JoinRoom(roomId: string): Promise<JoinModel> {
        return new Promise<JoinModel>((resolve, reject) => {
            SocketModel.io.emit('join-room', roomId, (result: ResultModel<JoinModel>) => {
                if (result.Error.HasError) {
                    reject(new Error(result.Error.Message))
                } else {
                    resolve(result.content)
                }
            })
        })
    }

    public static MadeRequest(roomId: string, cancel: boolean): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            SocketModel.io.emit('made-request', roomId, cancel, (result: ResultModel<void>) => {
                if (result.Error.HasError) {
                    reject(new Error(result.Error.Message))
                } else {
                    resolve(result.content)
                }
            })
        })
    }

    public static ManageRequest(roomId: string, usrId: string, promote: boolean): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            SocketModel.io.emit('manage-request', roomId, usrId, promote, (result: ResultModel<void>) => {
                if (result.Error.HasError) {
                    reject(new Error(result.Error.Message))
                } else {
                    resolve(result.content)
                }
            })
        })
    }

    public static callbackUpdateRooms: (roomsList: RoomModel[]) => void
    public static callbackUpdateRoom: (room: RoomModel) => void
    public static callbackUpdateRoomRequests: (room: RoomModel) => void
    public static callbackUpdateRequestsModal: (room: RoomModel) => void
    public static callbackUserPromoted: (roomId: string, tokens: TokenModel) => void
    public static callbackUserDemoted: (roomId: string) => void

    //#endregion

}