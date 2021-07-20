<template>
    <ion-page id="pgRoomsList">
        <ion-header>
            <!--<ion-toolbar>
                <ion-buttons>
                    <ion-back-button></ion-back-button>
                </ion-buttons>
                <ion-title>
                    Rooms
                </ion-title>
            </ion-toolbar>-->
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-button>
                        <i class="far fa-search"></i>
                    </ion-button>
                </ion-buttons>
                <ion-buttons slot="end">
                    <div class="gridBotoneraCabecera">
                        <div class="icono campana">
                            <!--<i class="far fa-bell"></i>-->
                            <img src="/assets/images/ico-correo.svg" alt="Campana" />
                        </div>
                        <div class="icono campana">
                            <!--<i class="far fa-bell"></i>-->
                            <img src="/assets/images/ico-calendario.svg" alt="Campana" />
                        </div>
                        <div class="icono campana online">
                            <!--<i class="far fa-bell"></i>-->
                            <img src="/assets/images/ico-campana.svg" alt="Campana" />
                            <div class="circulo"></div>
                        </div>
                        <div class="foto">
                            <img src="/assets/images/eclipse-ejemplo.jpg" alt="usuario" />
                        </div>
                    </div>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>
        <ion-content>
            
                <div class="estructuraFlex">
                    <div class="cabeceraInt">
                        <h1>Rooms</h1>
                    </div>
                    <div class="central">
                        <div class="icono">
                            <img src="/assets/images/ico-podcast.svg" alt="podcast" />
                        </div>
                        <h2>Hi Peter!</h2>
                        <p>It seems that there are no open rooms</p>
                        <p>
                            <button class="botonLink">Create a new room here<i class="fas fa-arrow-right"></i></button>
                        </p>
                    </div>
                    <div class="text-center">
                        <button class="btn btn-primary" @click="openRoomModal()"><i class="fal fa-plus marginright"></i>Create room</button>
                        <!--<ion-button expand="full" @click="openRoomModal()">
                            <ion-label>Create room</ion-label>
                        </ion-button>-->
                    </div>
                </div>
                
                <!-- Dinámico -->
                <div v-for="roomItem in roomList" :key="roomItem.name" @click="goToRoom(roomItem.Id);">
                    Room: {{roomItem.name}} <br/>
                    Type: {{(roomItem.onlySound ? 'Sound only' : 'Sound and video')}} <br/>
                    Participants: {{roomItem.speakers.length + roomItem.members.length}}
                </div>
                
            <div class="trianguloAbsolute">
                <img src="/assets/images/triangle.svg" alt="triangle" />
            </div>
            <div class="trianguloAbsoluteElipse">
                <img src="/assets/images/elipse-morada.svg" alt="elipse" />
            </div>
        </ion-content>
        <!--<ion-footer>
            <ion-button expand="full" @click="openRoomModal()">
                <ion-label>Create room</ion-label>
            </ion-button>
        </ion-footer>-->
    </ion-page>
</template>
<script src="./rooms-list.ts" lang="ts"></script>
<style lang="scss">
  @import './rooms-list.scss';
</style>