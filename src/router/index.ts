import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import RoomsList from '../pages/rooms-list/rooms-list.vue';
import Login from '../pages/login/login.vue';
import RoomsForm from '../pages/rooms-form/rooms-form.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '../pages/login'
    //redirect: '../roomslist'
    // ñapa
  },
  {
    path: '/login',
    component: Login
  },
  {
    path: '/roomslist',
    component: RoomsList
  },
  {
    path: '/roomsform/:roomId',
    component: RoomsForm
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
