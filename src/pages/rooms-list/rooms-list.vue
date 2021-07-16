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
            <div class="boxPadding">
                <div class="cabeceraInt">
                    <h1>Rooms</h1>
                </div>
                <ion-list>
                    <ion-item v-for="roomItem in roomList" :key="roomItem.name" @click="goToRoom(roomItem.Id);">
                        Room: {{roomItem.name}} <br/>
                        Type: {{(roomItem.onlySound ? 'Sound only' : 'Sound and video')}} <br/>
                        Participants: {{roomItem.speakers.length + roomItem.members.length}}
                    </ion-item>
                </ion-list>
            </div>
        </ion-content>
        <ion-footer>
            <ion-button expand="full" @click="openRoomModal()">
                <ion-label>Create room</ion-label>
            </ion-button>
        </ion-footer>
    </ion-page>
</template>
<script src="./rooms-list.ts" lang="ts"></script>
<style>
  @import './rooms-list.scss';
</style>