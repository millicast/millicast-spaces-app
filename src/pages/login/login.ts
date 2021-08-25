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
    data() {
        return {
            user: new UserModel()
        }
    },
    methods: {
        async doLogin() {
            try {
                const authenticationResult = await SocketModel.Authenticate(this.user.username)
                
                this.$user.username = authenticationResult.username
                this.$user.id = authenticationResult.id

                this.$router.replace('/roomslist')
            } catch (ex) {
                console.error(ex)
            }
        }
    }
})
