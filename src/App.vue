<template>
  <img src="/assets/images/foto-lily.jpg" style="position:absolute;visibility:hidden" />
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>
<script lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'App',
  components: {
    IonApp,
    IonRouterOutlet
  }
});
</script>
<style lang="scss">
  @import './App.scss';
</style>