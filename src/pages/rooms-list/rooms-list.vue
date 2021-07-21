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
                <div class="gridTarjetas" v-if="roomList.length >= 0">
                    <!-- maquetación estática -->
                    <!--<div class="tarjeta">
                        <div class="titulo">
                            <h2><i class="fas fa-microphone"></i><span>How do I apply UX Design process in product ✒️🎨💻</span></h2>
                        </div>
                        <div class="cuerpo">
                            <div>
                                <div class="fotos">
                                    <img src="/assets/images/usuario-01.png" alt="speaker" class="normal" />
                                    <img src="/assets/images/usuario-01.png" alt="speaker" class="superpuesta" />
                                </div>
                            </div>
                            <div>
                                <div class="usuarios">
                                    <ul>
                                        <li>Ariel Brailovsky</li>
                                        <li>Ariel Brailovsky</li>
                                        <li>Ariel Brailovsky</li>
                                    </ul>
                                </div>
                                <div class="badges">
                                    <div>
                                        <div>
                                            <p>4</p>
                                            <img src="/assets/images/ico-speaker-morado.svg" alt="speaker" />
                                        </div>
                                    </div>
                                    <div>
                                        <div>
                                            <p>4</p>
                                            <img src="/assets/images/ico-chat-morado.svg" alt="chat" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>-->
                    
                    <!--dynamic list -->
                    <div class="tarjeta" v-for="roomItem in roomList" :key="roomItem.name" @click="goToRoom(roomItem.Id);">
                        <div class="titulo">
                            <h2>
                                <i class="fas" v-bind:class="roomItem.onlySound ? 'fa-microphone' : 'fa-video'"></i>
                                <span>{{roomItem.name}}</span>
                            </h2>
                        </div>
                         
                        <div class="cuerpo">
                            <div>
                                <div class="fotos" v-if="roomItem.onlySound">
                                    <img src="/assets/images/usuario-01.png" alt="speaker" class="normal" />
                                    <img src="/assets/images/usuario-01.png" alt="speaker" class="superpuesta" />
                                </div>
                                <div class="videos" v-if="roomItem.onlySound == false">
                                    <div>
                                        <img src="/assets/images/ejemplo-video.png" alt="thumbnail video" class="normal" />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div class="usuarios">
                                    <ul>
                                        <li v-for="member in roomItem.speakers.slice(0, 4)" :key="member.id">{{member.user}}</li>
                                    </ul>
                                </div>
                                <div class="badges">
                                    <div>
                                        <div>
                                            <p>{{roomItem.speakers.length}}</p>
                                            <img src="/assets/images/ico-speaker-morado.svg" alt="speakers" />
                                        </div>
                                    </div>
                                    <div>
                                        <div>
                                            <p>{{roomItem.members.length}}</p>
                                            <img src="/assets/images/ico-chat-morado.svg" alt="members" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <!--fin dynamic list -->
                </div>
                <!-- Cuando no hay salas -->
                <div class="central" v-if="roomList.length == 0">
                    <div class="icono">
                        <img src="/assets/images/ico-podcast.svg" alt="podcast" />
                    </div>
                    <h2>Hi {{loginData.user}}!</h2>
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