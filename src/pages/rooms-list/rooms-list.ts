import
{
	IonButton, IonInput, IonPage, IonContent, IonHeader, modalController, IonLabel, IonItem, IonList,
	IonBackButton, IonButtons, IonTitle, IonToolbar, IonFooter
} from '@ionic/vue';
import UserModel from '../../models/rooms/UserModel';
import { defineComponent } from 'vue';
import roomsModal from '../rooms-modal/rooms-modal.vue';
import SocketModel from '../../models/socket/socket';
import { io, Socket } from 'socket.io-client';
import RoomModel from '@/models/rooms/RoomModel';

export default defineComponent({
	name: 'rooms',
	components: {
		IonButton, IonInput, IonPage, IonContent, IonHeader, IonLabel, IonItem, IonList, IonBackButton, IonButtons,
		IonTitle, IonToolbar, IonFooter
	},
	data()
	{
		return {
			rooms: null
		}
	},
	methods: {
		async openRoomModal()
		{
			const modal = await modalController.create({
				component: roomsModal,
				componentProps: {
				},
				cssClass: "",
				swipeToClose: true
			});

			modal.present();

		},
		async goToRoom(roomId: string)
		{
			this.$router.push({ path: `/roomsform/${roomId}` })
		},
	},
	mounted()
	{
		this.rooms = SocketModel.GetRooms();
	}
})