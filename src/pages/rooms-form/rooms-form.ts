import {
    IonButton, IonInput, IonPage, IonContent, IonHeader, IonLabel, IonItem, IonList,
    IonBackButton, IonButtons, IonTitle, IonToolbar, IonFooter, modalController, IonIcon
} from '@ionic/vue';
import { defineComponent } from 'vue';
import LoginModel from '../../models/login/LoginModel';
import RoomModel from '@/models/rooms/RoomModel';
import { useRoute } from 'vue-router';
import SocketModel from '../../models/socket/socket';
import requestsModal from '../requests-modal/requests-modal.vue';
import { Director, Publish, View, Logger } from '@millicast/sdk'

Logger.setLevel(Logger.DEBUG);

export default defineComponent({
    name: 'RoomsForm',
    components: {
        IonButton, IonInput, IonPage, IonContent, IonHeader, IonLabel, IonItem, IonList, IonBackButton, IonButtons,
        IonTitle, IonToolbar, IonFooter, IonIcon
    },
    data() {
        return {
            loginData: new LoginModel(),
            room: new RoomModel(),
            viewer: null,
            publisher: null,
            publishing: false,
            muted: false
        }
    },
    methods: {
        async init() {
            const cntViewerTags = document.getElementById("cntViewerTags")
            while (cntViewerTags.firstChild) 
                cntViewerTags.removeChild(cntViewerTags.firstChild);

            const route = useRoute();

            const roomId = route.params["roomId"].toString();
            const selectedRoom = await SocketModel.GetRoomById(roomId)

            this.loadRoom(selectedRoom);

            const usr = await SocketModel.GetRoomUser(roomId);

            await Promise.all([
                this.loadRoomUser(usr),
                this.assignSockets(),
                this.preparePublisher(usr, selectedRoom),
                this.prepareViewer(usr, selectedRoom)
            ]);
        },
        async close() {
            await Promise.all([
                this.viewer.stop(),
                this.stopPublisher()
            ]);
          
        },
        async assignSockets() {

            SocketModel.callbackUpdateRoom = async (room: RoomModel) => {
                let currRoom: RoomModel = this.room;
                let currUsr: LoginModel = this.loginData;

                if (currRoom != null && currRoom.Id == room.Id && currUsr != null) {

                    let selectedUser = room.members.filter(f => f.id == currUsr.id)[0] || room.speakers.filter(f => f.id == currUsr.id)[0];
                    //TODO: Publishing token can't be broacasted to all the participants in the room
                    if (this.loginData.pendingRequest && !selectedUser.pendingRequest && selectedUser.publisherToken)
                        //Start publishing
                        this.preparePublisher(selectedUser, room);
                    else if (!selectedUser.publisherToken && selectedUser.id!=room.OwnerId)
                        //TODO: send specific event for demoting
                        this.stopPublisher()
                    this.loadRoom(room);
                    await this.loadRoomUser(selectedUser);
                }
            };

            SocketModel.callbackUpdateRoomRequests = (room: RoomModel) => {
                let currRoom: RoomModel = this.room;
                let currUsr: LoginModel = this.loginData;
                if (currRoom != null && currUsr != null && currRoom.OwnerId == currUsr.id && currRoom.Id == room.Id) {
                    this.loadRoom(room);
                }
            };

        },
        async stopPublisher(){
            //If not publishing already
            if (!this.publishing)
                //Do nothing
                return;
            //Stop all tracks
            if (this.mediaStream) {
                for (const track of this.mediaStream.getTracks())
                    track.stop();
                this.mediaStream = null;
            }
            //Not publishing anymore
            this.publishing = false;
            //Stop publishing
            return this.publisher.stop();
	},
        async preparePublisher(usr: LoginModel, selectedRoom: RoomModel) {

            //Get user id
            const sourceId = usr.id;

            if (usr.publisherToken != null) {
                this.publisher = new Publish(selectedRoom.Id, () => { return usr.publisherToken });
                //We only capture video on video rooms and for the owner
                this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true , video: !selectedRoom.onlySound && selectedRoom.OwnerId==sourceId});
                //Not muted
                this.muted = false;
                //Show local video
                if (this.mediaStream.getVideoTracks().length) {
                    //Create new video element
                    const element = document.createElement("video");
                    //Set src stream
                    element.srcObject = this.mediaStream;
                    //Set other properties
                    element.autoplay = true;
                    element.controls = true;
                    //Local video has to be muted and mirrored
                    element.muted = true;
                    element.style.transform = "scale(-1, 1)";
                    element.addEventListener("click", function () {
                        element.play();
                        return false;
                    });
                    //Append it
                    document.getElementById("cntViewerTags").appendChild(element);
                }
                await this.publisher.connect({
                    mediaStream : this.mediaStream,
                    sourceId : sourceId,
                    disableVideo: selectedRoom.onlySound,
                    dtx: true,
                    peerConfig: {
                        iceServers : []
                    }
                })
                this.publishing = true;
            }

        },
        async prepareViewer(usr: LoginModel, selectedRoom: RoomModel) {

            let sourceId = usr.id;

            this.viewer = new View(selectedRoom.Id, () => { return usr.viewerToken });

            this.viewer.on("track", (event) => {
                //Get track and transceiver from event
                const track = event.track;
                const transceiver = event.transceiver;
                //Get stream
                let stream = event.streams[0];

                //Do not duplicate
                if (document.getElementById(stream.id))
                    return;
                //Create new video element
                const element = document.createElement(stream.getVideoTracks().length ? "video" : "audio");
                //If it is multiaudio
                if (stream.getAudioTracks().length > 1)
                    //New stream
                    stream = new MediaStream([track]);
                //Set same id
                element.id = stream.id;
                //Set trackId mediaId as data
                element.dataset.trackId = track.id;
                element.dataset.mid = transceiver.mid;
                //Set src stream
                element.srcObject = stream;
                //Set other properties
                element.autoplay = true;
                element.controls = true;
                element.muted = false;
                element.addEventListener("click", function () {
                    element.play();
                    return false;
                });
                //Append it
                document.getElementById("cntViewerTags").appendChild(element);
            });

            this.viewer.on("broadcastEvent", (event) => {
                //Get event name and data
                const { name, data } = event;

                switch (name) {
                    case "active":
                        console.log(`active source ${data.sourceId}`);
                        break;
                    case "inactive":
                        console.log(`inactive source ${data.sourceId}`);
                        break;
                    case "vad":
                        console.log(data.sourceId ? `mid ${data.mediaId} multiplexing source ${data.sourceId}` : `mid ${data.mediaId} not multiplexing any source`);
                        //Get audio tag
                        const audio: any = document.querySelector(`audio[data-mid="${data.mediaId}"]`);
                        //TODO: events may be received before the track is added
                        if (audio) {
                            if (data.sourceId)
                                //Set new speaker
                                audio.dataset.sourceId = data.sourceId;
                            else
                                //Remove it
                                delete (audio.dataset.sourceId);

                        }
                        //Find old speaker
                        const oldSpeaker = this.room.speakers.find(s => s.multiplexedId = data.mediaId);
                        //If there was a previous speaker in that multiplexed id
                        if (oldSpeaker) {
                                //Not multiplexed anymore
                                oldSpeaker.multiplexedId = null;
                                oldSpeaker.audioLevel = 0;
                        }
                        //Find new speaker
                        const speaker = this.room.speakers.find(s => s.id == data.sourceId);
                        //If got it
                        if (speaker) {
                                //Assing multiplexing id
                                speaker.multiplexedId = data.mediaId;
                                speaker.audioLevel = 0;
                        }

                }
            });

            await this.viewer.connect({
                pinnedSourceId: selectedRoom.OwnerId!=sourceId ? selectedRoom.OwnerId : null,
                multiplexedAudioTracks: 3,
                excludedSourceIds: [sourceId],
                disableVideo: selectedRoom.onlySound || selectedRoom.OwnerId==sourceId,
                dtx: true,
                peerConfig: {
                    iceServers : []
                }
            });
            //Get pc
            const pc = await this.viewer.getRTCPeerConnection();
            //Get stats periodically
            setInterval(async () => {
                const stats = await pc.getStats();
                for (const [name, stat] of stats) {
                    //Find the audio stat
                    if (stat.kind == "audio") {
                        //Get track stats
                        const trackStats = stats.get(stat.trackId)
                        if (trackStats) {
                            //Get track id
                            const trackId = trackStats.trackIdentifier;
                            //Get audio tag
                            const audio: any = document.querySelector(`audio[data-track-id="${trackId}"]`);
                            //If founrd
                            if (audio)
                                //Get audio level
                                audio.dataset.audioLevel = stat.audioLevel;
                            //Find transceiver associated to the track Id
                            const transceiver = pc.getTransceivers().find(t => t.receiver.track.id == trackId);
                            //Skip if not found
                            if (!transceiver)
                                continue;
                            //Find new speaker
                            const speaker = this.room.speakers.find(s => s.multiplexedId == transceiver.mid);
                            //If got it
                            if (speaker) {
                                speaker.audioLevel = stat.audioLevel;
                            }
                        }
                    }
                }
            }, 100);

        },
        loadRoom(room: RoomModel) {
            this.room = room;
        },
        loadRoomUser(usr: LoginModel) {

            this.loginData = usr;

        },
        async openRequestModal() {

            const modal = await modalController.create({
                component: requestsModal,
                componentProps: {
                    room: this.room
                },
                cssClass: "",
                swipeToClose: true,
                backdropDismiss: true
            });

            // modal.onDidDismiss().then((data) => {

            //     if (data['data'] !== undefined && data['data'] !== null) {

            //         let newRoom: RoomModel = data['data'];

            //         this.loadRoom(newRoom);
            //         this.assignSockets();
            //     }

            // });

            modal.present();

        },
        async madeRequest(cancel: boolean) {
            let currUsr: LoginModel = this.loginData;
            let currRoom: RoomModel = this.room;

            currUsr.pendingRequest = cancel;

            let roomUsr = currRoom.members.filter(f => f.id == currUsr.id)[0]
            if (roomUsr != null) {
                roomUsr.pendingRequest = cancel;
            }

            await SocketModel.MadeRequest(currRoom.Id, cancel)
        },
        async manageRequest(usrId: string, promote: boolean) {
            let currRoom: RoomModel = this.room;
            await SocketModel.ManageRequest(currRoom.Id, usrId, promote)
        },
        toggleMute() {  
            const audioTrack =  this.mediaStream.getAudioTracks()[0];
            audioTrack.enabled = !audioTrack.enabled;
            this.muted = !audioTrack.enabled;
        }
    },
    mounted() {
        this.init();
    },
    unmounted() {
        this.close();
    },     
})
