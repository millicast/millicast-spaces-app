<template>
    <ion-page id="pgRoomsModal">
        <ion-header>
            <ion-toolbar>
                <ion-buttons>
                    <ion-button @click="closeModal()">
                        <ion-icon :icon="arrowBack"></ion-icon>
                    </ion-button>
                </ion-buttons>
                <ion-title>
                    Create room
                </ion-title>
            </ion-toolbar>
        </ion-header>
        <ion-content>
            <ion-item lines="full">
                <ion-label position="floating">Room name</ion-label>
                <ion-input type="text" @input="room.name=$event.target.value"></ion-input>
            </ion-item>
            <div @click="room.onlySound = false;" v-bind:class="{ 'active': (room.onlySound != null && !room.onlySound) }">SOUND AND VIDEO</div>
            <div @click="room.onlySound = true;" v-bind:class="{ 'active': (room.onlySound != null && room.onlySound) }">SOUND ONLY</div>
        </ion-content>
        <ion-footer>
            <ion-button expand="full" @click="createRoom()" :disabled="room.name == '' || room.name == null || room.onlySound == null">
                <ion-label>Create</ion-label>
            </ion-button>
        </ion-footer>
    </ion-page>
</template>
<script src="./rooms-modal.ts" lang="ts"></script>
<style lang="scss">
  @import './rooms-modal.scss';
</style>