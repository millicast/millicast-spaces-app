import {
    IonButton, IonInput, IonPage, IonContent, IonHeader, modalController, IonLabel, IonItem, IonList,
    IonBackButton, IonButtons, IonTitle, IonToolbar, IonFooter
} from '@ionic/vue';
import LoginModel from '../../models/login/LoginModel';
import { defineComponent } from 'vue';
import roomsModal from '../rooms-modal/rooms-modal.vue';
import SocketModel from '../../models/socket/socket';
import { io, Socket } from 'socket.io-client';
import RoomModel from '@/models/rooms/RoomModel';

export default defineComponent({
    name: 'RoomsList',
    components: {
        IonButton, IonInput, IonPage, IonContent, IonHeader, IonLabel, IonItem, IonList, IonBackButton, IonButtons,
        IonTitle, IonToolbar, IonFooter
    },
    data() {
        return {
            roomList: []
        }
    },
    methods: {
        async initRooms() {
            let roomList = await SocketModel.GetRooms();
            this.loadRooms(roomList);
        },
        loadRooms(roomList: RoomModel[]) {

            this.roomList = [];

            for (let room of roomList) {

                this.roomList.push(room);

            }

        },
        async openRoomModal() {

            const modal = await modalController.create({
                component: roomsModal,
                componentProps: {
                },
                cssClass: "",
                swipeToClose: true
            });

            modal.present();

        },
        async goToRoom(roomId: string) {
            await SocketModel.JoinRoom(roomId)
            this.$router.push({ path: `/roomsform/${roomId}` })
        },
        async exitRooms() {
            SocketModel.ExitRooms();
        }
    },
    ionViewDidEnter() {
        this.exitRooms();
        this.initRooms();

        SocketModel.callbackUpdateRooms = (roomsList: RoomModel[]) => {
            this.loadRooms(roomsList);
        };
    }
})