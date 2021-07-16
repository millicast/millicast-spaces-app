import {
    IonButton, IonInput, IonPage, IonContent, IonHeader, modalController, IonLabel, IonItem, IonList,
    IonBackButton, IonButtons, IonTitle, IonToolbar, IonFooter, IonIcon
} from '@ionic/vue';
import { defineComponent } from 'vue';
import RoomModel from '@/models/rooms/RoomModel';
import { arrowBack } from "ionicons/icons";
import SocketModel from '../../models/socket/socket';

export default defineComponent({
    name: 'RequestsModal',
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
        async closeModal() {
            const modal = await modalController.getTop();
            modal.dismiss();
        },
        async initModal() {
            const modal = await modalController.getTop();
            this.loadData(modal.componentProps["room"]);
        },
        loadData(room: RoomModel) {

            this.room = room;

        },
        async manageRequest(usrId: string, promote: boolean) {
            let currRoom: RoomModel = this.room;
            await SocketModel.ManageRequest(currRoom.Id, usrId, promote)

            currRoom = this.room;

            if(!(currRoom.members.filter(f => f.pendingRequest != null && f.pendingRequest).length > 0)) {

                this.closeModal();

            }
        }
    },
    mounted() {
        this.initModal();

        SocketModel.callbackUpdateRequestsModal = (room: RoomModel) => {
            let currRoom: RoomModel = this.room;
            if (currRoom != null && currRoom.OwnerId) {
                this.loadData(room);
            }
        };

    }
})
