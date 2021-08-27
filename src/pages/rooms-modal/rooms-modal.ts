import {
    IonButton, IonInput, IonPage, IonContent, IonHeader, modalController, IonLabel, IonItem, IonList,
    IonBackButton, IonButtons, IonTitle, IonToolbar, IonFooter, IonIcon
} from '@ionic/vue';
import { defineComponent } from 'vue';
import RoomModel from '@/models/rooms/RoomModel';
import { arrowBack } from "ionicons/icons";
import SocketModel from '../../models/socket/socket';

export default defineComponent({
    name: 'RoomsModal',
    components: {
        IonButton, IonInput, IonPage, IonContent, IonHeader, IonLabel, IonItem, IonList, IonBackButton, IonButtons,
        IonTitle, IonToolbar, IonFooter, IonIcon
    },
    data() {
        return {
            arrowBack,
            room: new RoomModel()
        }
    },
    methods: {
        async createRoom() {
            const modal = await modalController.getTop();

            let newRoom = new RoomModel()

            newRoom.name = this.room.name
            newRoom.audioOnly = this.room.audioOnly

            const roomId = await SocketModel.CreateRoom(newRoom)

            modal.dismiss();

            this.$router.push({ path: `/roomsform/${roomId}` })
        },
        async closeModal() {
            const modal = await modalController.getTop();
            modal.dismiss();
        }
    }
})
