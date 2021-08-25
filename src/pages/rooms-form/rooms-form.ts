import {
    IonButton, IonInput, IonPage, IonContent, IonHeader, IonLabel, IonItem, IonList,
    IonBackButton, IonButtons, IonTitle, IonToolbar, IonFooter, modalController, IonIcon
} from '@ionic/vue';
import { defineComponent } from 'vue';
import LoginModel from '../../models/login/LoginModel';
import TokenModel from '../../models/common/TokenModel';
import RoomModel from '@/models/rooms/RoomModel';
import { useRoute, useRouter } from 'vue-router';
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
            muted: false,
            showPendingRequestsList: false,
            showManageUserWindow: false,
            SelectedUser: new LoginModel(),
            LastPendingRequestUser: new LoginModel(),
            showMsgWindow: false
        }
    },
    computed: {
        audioOnlySpeakers: function () {
            return this.room.audioOnly ? this.room.speakers : this.room.speakers.filter(m => m.id != this.room.ownerId);
        },
        owner: function () {
            return this.room.speakers.find(m => m.id == this.room.ownerId);
        }
    },
    methods: {
        async init() {
            const cntViewerTags = document.getElementById("cntViewerTags")
            while (cntViewerTags && cntViewerTags.firstChild)
                cntViewerTags.removeChild(cntViewerTags.firstChild);

            const route = useRoute();

            const roomId = route.params["roomId"].toString();
            //The list of multiplexed audios
            this.multiplexed = {};
            //Read current user from global state
            const user = this.$loginData;
            //Join room and retrieve publisher and viewer stats
            const { tokens, room } = await SocketModel.JoinRoom(roomId);
          

            await Promise.all([
                this.loadRoomUser(user),
                this.loadRoom(room),
                this.assignSockets(),
                this.preparePublisher(user, tokens, room),
                this.prepareViewer(user, tokens, room)
            ]);
        },
        async close() {
            //Clean media elements
            for (const element of document.querySelectorAll<HTMLMediaElement>("audio,video"))
                element.srcObject = null;
            await Promise.all([
                this.stopViewer(),
                this.stopPublisher()
            ]);

        },
        async assignSockets() {

            SocketModel.callbackUserPromoted = async (roomId: string, tokens: TokenModel) => {
                //Start publishing
                this.preparePublisher(this.loginData, tokens, this.room);

                this.openMsgWindow(this.loginData);
            };
            SocketModel.callbackUserDemoted = async (roomId: string) => {
                //Stop publishing
                this.stopPublisher();

                this.openMsgWindow(this.loginData);
            };
            SocketModel.callbackUserEjected = async (roomId: string) => {
                this.$router.back()

            }
            SocketModel.callbackUserMute = async (roomId: string) => {
                const audioTrack = this.mediaStream.getAudioTracks()[0];
                audioTrack.enabled = false;
                this.muted = !audioTrack.enabled;
                console.log('You have been muted.')
            }

            SocketModel.callbackUpdateRoom = async (room: RoomModel) => {
                let currRoom: RoomModel = this.room;
                let currUsr: LoginModel = this.loginData;

                if (currRoom != null && currRoom.id == room.id && currUsr != null) {

                    let selectedUser = room.members.filter(f => f.id == currUsr.id)[0] || room.speakers.filter(f => f.id == currUsr.id)[0];
                    this.loadRoom(room);
                    this.loadRoomUser(selectedUser);
                }
            };

            SocketModel.callbackUpdateRoomRequests = (room: RoomModel, pendingRequestUser: LoginModel) => {
                let currRoom: RoomModel = this.room;
                let currUsr: LoginModel = this.loginData;
                if (currRoom != null && currUsr != null && currRoom.ownerId == currUsr.id && currRoom.id == room.id) {
                    this.loadRoom(room);

                    this.openMsgWindow(pendingRequestUser);
                }
            };

        },
        async stopViewer() {
            //Stop stats interval
            clearInterval(this.viewingStats);
            //Stop viewer
            await this.viewer.stop();
            //Done
            this.viewer = null;
        },
        async stopPublisher() {
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
            //Stop stats interval
            clearInterval(this.publishingStats);
            //Stop publishing
            await this.publisher.stop();
            //Done
            this.publisher = null;
            //Stop stats interval
            clearInterval(this.publishingStats);
        },
        async preparePublisher(usr: LoginModel, tokens: TokenModel, room: RoomModel) {

            //Get user id
            const sourceId = usr.id;

            if (tokens.publisherToken != null && this.publisher == null) {
                this.publisher = new Publish(room.id, () => { return tokens.publisherToken });
                //We only capture video on video rooms and for the owner
                this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: !room.audioOnly && room.ownerId == sourceId });
                //Not muted
                this.muted = false;
                //Show local video
                if (this.mediaStream.getVideoTracks().length) {
                    //Get video element
                    const element = document.querySelector(".mainVideo video") as HTMLVideoElement;
                    //Set src stream
                    element.srcObject = this.mediaStream;
                    //Local video has to be muted and mirrored
                    element.muted = true;
                    element.style.transform = "scale(-1, 1)";
                    element.play();
                    element.addEventListener("click", function () {
                        element.play();
                        return false;
                    });
                }
                this.publishing = true;
                await this.publisher.connect({
                    mediaStream: this.mediaStream,
                    sourceId: sourceId,
                    disableVideo: room.audioOnly,
                    dtx: true,
                    peerConfig: {
                        iceServers: []
                    }
                })
                //Get pc
                const pc = await this.publisher.getRTCPeerConnection();
                //Get stats periodically
                this.publishingStats = setInterval(async () => {
                    const stats = await pc.getStats();
                    for (const [name, stat] of stats) {
                        //Find the audio stat
                        if (stat.kind == "audio" && stat.type == "media-source") {
                            //Find us
                            const us = this.room.speakers.find(s => s.id == this.loginData.id);
                            //Set our audio level
                            us.audioLevel = stat.audioLevel;
                            //Done
                            return;
                        }
                    }
                }, 100);
            }
        },
        async prepareViewer(usr: LoginModel, tokens: TokenModel, room: RoomModel) {

            let sourceId = usr.id;

            this.viewer = new View(room.id, () => { return tokens.viewerToken });

            this.viewer.on("track", (event) => {
                //Get track and transceiver from event
                const track = event.track;
                const transceiver = event.transceiver;
                //Get stream
                let stream = event.streams[0];
                //If it is main video
                if (stream.getVideoTracks().length) {
                    //Get video element
                    const element = document.querySelector(".mainVideo video") as HTMLVideoElement;
                    //Do not duplicate
                    if (element.id == stream.id)
                        return;
                    //Set same id
                    element.id = stream.id;
                    //Set src stream
                    element.srcObject = stream;
                    //Set other properties
                    element.autoplay = true;
                    element.muted = false;
                    element.play();
                    element.addEventListener("click", function () {
                        element.play();
                        return false;
                    });
                } else {
                    //Do not duplicate
                    if (document.getElementById(stream.id))
                        return;
                    //Create new video element
                    const element = document.createElement("audio");
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
                }
            });

            this.viewer.on("broadcastEvent", (event) => {
                //Get event name and data
                const { name, data } = event;

                switch (name) {
                    case "active":
                        //console.log(`active source ${data.sourceId}`);
                        break;
                    case "inactive":
                        //console.log(`inactive source ${data.sourceId}`);
                        break;
                    case "vad":
                        console.log(data.sourceId ? `mid ${data.mediaId} multiplexing source ${data.sourceId}` : `mid ${data.mediaId} not multiplexing any source`);
                        //Store the multiplexing info, as the participant info may be received after this data
                        this.multiplexed[data.mediaId] = data.sourceId;
                        //Find old speaker
                        const oldSpeaker = this.room.speakers.find(s => s.multiplexedId == data.mediaId);
                        //If there was a previous speaker in that multiplexed id
                        if (oldSpeaker) {
                            //Not multiplexed anymore
                            delete(oldSpeaker.multiplexedId);
                            delete(oldSpeaker.audioLevel);
                        }
                        //Find new speaker
                        const speaker = this.room.speakers.find(s => s.id == data.sourceId);
                        //If got it
                        if (speaker) {
                            //Assing multiplexing id
                            speaker.multiplexedId = data.mediaId;
                            speaker.audioLevel = 0;
                        }
                        console.log("old: " + (oldSpeaker ? oldSpeaker.user : "none") + "new: " + (speaker ? speaker.user : "none"));

                }
            });

            await this.viewer.connect({
                pinnedSourceId: room.ownerId != sourceId ? room.ownerId : null,
                multiplexedAudioTracks: 3,
                excludedSourceIds: [sourceId],
                disableVideo: room.audioOnly || room.ownerId == sourceId,
                dtx: true,
                peerConfig: {
                    iceServers: []
                }
            });
            //Get pc
            const pc = await this.viewer.getRTCPeerConnection();
            //Get stats periodically
            this.viewingStats = setInterval(async () => {
                //IF we are not the owners
                if (this.loginData.id != undefined && this.loginData.id != this.room.ownerId) {
                    //Get first audio transceiver
                    const mainAudio = pc.getTransceivers().filter(t => t.receiver.track.kind == "audio")[0];
                    //Find ownser
                    const owner = this.room.speakers.find(s => s.id == this.room.ownerId);
                    //Set mid
                    if (mainAudio && owner)
                        //Set it
                        owner.multiplexedId = mainAudio.mid;
                }
                //Find 
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
                            //Find transceiver associated to the track id
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
            //Update room data
            this.room = room;
            //Restore multiplexing data
            for (let [mediaId,sourceId] of Object.entries(this.multiplexed))
            {
                //Find speaker
                const speaker = this.room.speakers.find(s => s.id == sourceId);
                //If got it
                if (speaker) {
                    //Assing multiplexing id
                    speaker.multiplexedId = mediaId;
                    speaker.audioLevel = 0;
                }
            }
        },
        loadRoomUser(usr: LoginModel) {
            this.loginData = usr;
        },
        async madeRequest(cancel: boolean) {
            let currUsr: LoginModel = this.loginData;
            let currRoom: RoomModel = this.room;

            currUsr.pendingRequest = cancel;

            let roomUsr = currRoom.members.filter(f => f.id == currUsr.id)[0]
            if (roomUsr != null) {
                roomUsr.pendingRequest = cancel;
            }

            await SocketModel.MadeRequest(currRoom.id, cancel)
        },
        async manageRequest(usrId: string, promote: boolean) {
            let currRoom: RoomModel = this.room;
            await SocketModel.ManageRequest(currRoom.id, usrId, promote);

            this.showManageUserWindow = false;
            this.closeMsgWindow();
        },
        async ejectFromRoom(usrId: string) {
            let currRoom: RoomModel = this.room;
            await SocketModel.EjectFromRoom(currRoom.id, usrId)

            this.showManageUserWindow = false;
            this.closeMsgWindow();
        },
        async muteSpeaker(usrId: string) {
            let currRoom: RoomModel = this.room;
            await SocketModel.MuteSpeaker(currRoom.id, usrId)

            console.log('Mute user: ' + usrId)

            this.showManageUserWindow = false
            this.closeMsgWindow()
        },
        toggleMute() {
            const audioTrack = this.mediaStream.getAudioTracks()[0];
            audioTrack.enabled = !audioTrack.enabled;
            this.muted = !audioTrack.enabled;
        },
        openUserWindow(selectedUser: LoginModel) {
            if (this.loginData.id == this.room.ownerId && selectedUser.id != this.room.ownerId) {
                this.SelectedUser = selectedUser;
                this.showManageUserWindow = true;
            }
        },
        openMsgWindow(pendingRequestUser: LoginModel) {

            if (pendingRequestUser != null && pendingRequestUser.pendingRequest && pendingRequestUser.id != this.loginData.id && this.room.ownerId == this.loginData.id) {
                this.showMsgWindow = true;
                this.LastPendingRequestUser = pendingRequestUser;
            }
            
            if(pendingRequestUser != null && pendingRequestUser.pendingRequest != true && pendingRequestUser.id == this.loginData.id){
                this.showMsgWindow = true;
                this.LastPendingRequestUser = pendingRequestUser;
            }

        },
        closeMsgWindow() {
            this.showMsgWindow = false;
            this.LastPendingRequestUser = new LoginModel();
        },
        async manageMsgWindowRequest(usrId: string, promote: boolean) {
            await this.manageMsgWindowRequest(usrId, promote);

            this.showMsgWindow = false;
            this.LastPendingRequestUser = new LoginModel();
        }
    },
    mounted() {
        this.init();
    },
    unmounted() {
        this.close();
    },
})
