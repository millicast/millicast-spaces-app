import {
    IonButton, IonInput, IonPage, IonContent, IonHeader, modalController, IonLabel, IonItem, IonList,
    IonBackButton, IonButtons, IonTitle, IonToolbar, IonFooter
} from '@ionic/vue';
import LoginModel from '../../models/login/LoginModel';
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
            loginData: new LoginModel()
        }
    },
    methods: {
        async doLogin() {
            
            try {
                let authenticationResult = await SocketModel.Authenticate(this.loginData.user)
                
                this.$loginData.user = authenticationResult.user
                this.$loginData.id = authenticationResult.id

                this.$router.replace('/roomslist')
            } catch (ex) {
                console.error(ex)
            }

        }
    }
})
