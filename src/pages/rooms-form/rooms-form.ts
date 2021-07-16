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
            publisher: null
        }
    },
    methods: {
        async init() {
            const route = useRoute();

            const roomId = route.params["roomId"].toString();
            const selectedRoom = await SocketModel.GetRoomById(roomId)

            this.loadRoom(selectedRoom);

            let usr = await SocketModel.GetRoomUser(roomId);

            await this.loadRoomUser(usr);

            await this.assignSockets();

            await this.preparePublisher(usr, roomId);
            await this.prepareViewer(usr, selectedRoom);

        },
        async assignSockets() {

            SocketModel.callbackUpdateRoom = async (room: RoomModel) => {
                let currRoom: RoomModel = this.room;
                let currUsr: LoginModel = this.loginData;

                if (currRoom != null && currRoom.Id == room.Id && currUsr != null) {

                    let selectedUser = room.members.filter(f => f.appToken == currUsr.appToken)[0] || room.speakers.filter(f => f.appToken == currUsr.appToken)[0];

                    this.loadRoom(room);
                    await this.loadRoomUser(selectedUser);
                }
            };

            SocketModel.callbackUpdateRoomRequests = (room: RoomModel) => {
                let currRoom: RoomModel = this.room;
                let currUsr: LoginModel = this.loginData;
                if (currRoom != null && currUsr != null && currRoom.OwnerId == currUsr.appToken && currRoom.Id == room.Id) {
                    this.loadRoom(room);
                }
            };

        },
        async preparePublisher(usr: LoginModel, roomId: string) {

            let sourceId = usr.appToken;

            if (usr.publisherToken != null) {
                this.publisher = new Publish(roomId, () => { return usr.publisherToken });

                //Capture mic
                let mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                await this.publisher.connect({
                    mediaStream,
                    sourceId,
                    disableVideo:true
                })
            }

        },
        async prepareViewer(usr: LoginModel, selectedRoom: RoomModel) {

            let sourceId = usr.appToken;

            this.viewer = new View(selectedRoom.Id, () => { return usr.viewerToken });

            this.viewer.on("track", (event) => {
                {
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
                    //Set 
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
                }
            });

            await this.viewer.connect({
                pinnedSourceId: selectedRoom.OwnerId,	 // Set here the id of the room creator
                multiplexedAudioTracks: 3,
                excludedSourceIds: [sourceId]
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

            let roomUsr = currRoom.members.filter(f => f.appToken == currUsr.appToken)[0]
            if (roomUsr != null) {
                roomUsr.pendingRequest = cancel;
            }

            await SocketModel.MadeRequest(currRoom.Id, cancel)
        },
        async manageRequest(usrId: string, promote: boolean) {
            let currRoom: RoomModel = this.room;
            await SocketModel.ManageRequest(currRoom.Id, usrId, promote)
        }
    },
    mounted() {
        this.init();
    }
})
