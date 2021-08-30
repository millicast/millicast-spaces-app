import {
	IonButton, IonInput, IonPage, IonContent, IonHeader, modalController, IonLabel, IonItem, IonList,
	IonBackButton, IonButtons, IonTitle, IonToolbar, IonFooter
} from '@ionic/vue';
import UserModel from '../../models/rooms/UserModel';
import { defineComponent } from 'vue';
import SocketModel from '../../models/socket/socket';

export default defineComponent({
	name: 'Login',
	components: {
		IonButton, IonInput, IonPage, IonContent, IonHeader, IonLabel, IonItem, IonList, IonBackButton, IonButtons,
		IonTitle, IonToolbar, IonFooter
	},
	data()
	{
		return {
			user: new UserModel(),
			authenticationFailed: false,
			errorMessage: null
		}
	},
	methods: {
		async doLogin()
		{
			try
			{
				//Authenticate user
				const authenticationResult = await SocketModel.Authenticate(this.user.username)
				//Store user details on global user
				this.$user.username = authenticationResult.username;
				this.$user.id = authenticationResult.id;
				//Move to room list
				this.$router.replace('/roomslist');
			} catch (ex) {
				this.showAauthenticationFailed(ex);	
				console.error("login error", ex)
			}
		},
		showAauthenticationFailed(errorMessage: string)
		{
			this.errorMessage = errorMessage;
			clearTimeout(this.authenticationFailed)
			this.authenticationFailed = setTimeout(() =>
			{
				this.authenticationFailed = false;
			}, 5000);
		},
		hideAauthenticationFailed()
		{
			clearTimeout(this.authenticationFailed)
			this.authenticationFailed = false;
		}
	}
})
