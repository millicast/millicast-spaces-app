<template>
    <ion-page id="pgRoomsList">
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-button>
                        <i class="far fa-search"></i>
                    </ion-button>
                </ion-buttons>
                <ion-buttons slot="end">
                    <div class="gridBotoneraCabecera">
                        <div class="icono campana">
                            <img src="/assets/images/ico-correo.svg" alt="Campana" />
                        </div>
                        <div class="icono campana">
                            <img src="/assets/images/ico-calendario.svg" alt="Campana" />
                        </div>
                        <div class="icono campana online">
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
                <div class="gridTarjetas" v-if="rooms.length >= 0">
                    <!--dynamic list -->
                    <div class="tarjeta" v-for="room in rooms" :key="room.name" @click="goToRoom(room.id);">
                        <div class="titulo">
                            <h2>
                                <i class="fas" v-bind:class="room.audioOnly ? 'fa-microphone' : 'fa-video'"></i>
                                <span>{{room.name}}</span>
                            </h2>
                        </div>
                         
                        <div class="cuerpo">
                            <div>
                                <div class="fotos" v-if="room.audioOnly">
                                    <img src="/assets/images/usuario-01.png" alt="usuario" class="normal" />
                                    <img src="/assets/images/usuario-02.png" alt="usuario" class="superpuesta" />
                                </div>
                                <div class="videos" v-if="room.audioOnly == false">
                                    <div>
                                        <img src="/assets/images/ejemplo-video.png" alt="thumbnail video" class="normal" />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div class="usuarios">
                                    <ul>
                                        <li v-if="room.participants[room.ownerId]">{{room.participants[room.ownerId].username}}</li>
                                    </ul>
                                </div>
                                <div class="badges">
                                    <div>
                                        <div>
                                            <p>{{Object.keys(room.speakers).length}}</p>
                                            <img src="/assets/images/ico-speaker-morado.svg" alt="speakers" />
                                        </div>
                                    </div>
                                    <div>
                                        <div>
                                          <p>{{Object.keys(room.participants).length-Object.keys(room.speakers).length}}</p>
                                            <img src="/assets/images/ico-audience-morado.svg" alt="audience" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <!--fin dynamic list -->
                </div>
                <!-- Cuando no hay salas -->
                <div class="central" v-if="rooms.length == 0">
                    <div class="icono">
                        <img src="/assets/images/ico-podcast.svg" alt="podcast" />
                    </div>
                    <h2>Hi {{user.username}}!</h2>
                    <p>It seems that there are no open rooms</p>
                    <p>
                        <button class="botonLink" @click="openRoomModal()">Create a new room here<i class="fas fa-arrow-right"></i></button>
                    </p>
                </div>
                <div class="btnFixed">
                    <button class="btn btn-primary" @click="openRoomModal()"><i class="fal fa-plus marginright"></i>Create room</button>
                </div>
            </div>
            <div class="trianguloAbsolute">
                <img src="/assets/images/triangle.svg" alt="triangle" />
            </div>
            <div class="trianguloAbsoluteElipse">
                <img src="/assets/images/elipse-morada.svg" alt="elipse" />
            </div>
        </ion-content>
    </ion-page>
</template>
<script src="./rooms-list.ts" lang="ts"></script>
<style lang="scss">
  @import './rooms-list.scss';
</style>