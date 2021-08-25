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
                    Create new room
                </ion-title>
            </ion-toolbar>
        </ion-header>
        <ion-content>
            <div class="boxPadding">
                <ion-item class="boxInput" lines="none">
                    <ion-label position="floating">Enter the name of the room</ion-label>
                    <ion-input type="text" @input="room.name=$event.target.value"></ion-input>
                </ion-item>

                <div class="gridBotones mt30 mb30">
                    <div>
                        <div>
                            <div class="itemSeleccion" @click="room.audioOnly = true;" v-bind:class="{ 'active': (room.audioOnly != null && room.audioOnly) }">
                                <img src="/assets/images/ico-audio.svg" alt="audio" />
                                <p>Audio only</p>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div>
                            <div class="itemSeleccion" @click="room.audioOnly = false;" v-bind:class="{ 'active': (room.audioOnly != null && !room.audioOnly) }">
                                <img src="/assets/images/ico-video.svg" alt="video" />
                                <p>Audio and Video</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="separatorHorizontal">
                    <p>Create a new room open for everyone</p>
                    <button class="btn btn-primary" @click="createRoom()" :disabled="room.name == '' || room.name == null || room.audioOnly == null">Go</button>
                </div>

            <!--<div @click="room.audioOnly = false;" v-bind:class="{ 'active': (room.audioOnly != null && !room.audioOnly) }">SOUND AND VIDEO</div>
            <div @click="room.audioOnly = true;" v-bind:class="{ 'active': (room.audioOnly != null && room.audioOnly) }">SOUND ONLY</div>-->
            </div>
        </ion-content>
        <!--<ion-footer>
            <ion-button expand="full" @click="createRoom()" :disabled="room.name == '' || room.name == null || room.audioOnly == null">
                <ion-label>Create</ion-label>
            </ion-button>
        </ion-footer>-->
    </ion-page>
</template>
<script src="./rooms-modal.ts" lang="ts"></script>
<style lang="scss">
  @import './rooms-modal.scss';
</style>