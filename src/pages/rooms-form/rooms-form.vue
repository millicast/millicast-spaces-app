<template>
    <ion-page id="pgRoomsForm">
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                      <ion-back-button></ion-back-button>
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
            <div class="estructuraFlex saveFaldon">
                <div class="cabeceraInt flex" v-if="room">
                    <div>
                        <h2>{{room.name}}</h2>
                    </div>
                    <div>
                        <button class="btnMenuInterior">
                            <i class="far fa-ellipsis-h"></i>
                        </button>
                    </div>
                    
                </div>
                <div class="titular mb20">
                    <div>
                        <img src="/assets/images/ico-speaker.svg" alt="speaker" />
                    </div>
                    <div>
                        <h3>Speakers <span>({{room.speakers.length}})</span></h3>
                    </div>
                </div>

                <!-- Toasts -->
                <!--<div class="toast success">
                    <div class="icono">
                        <i class="fal fa-hand-paper"></i>
                    </div>
                    <div>
                        <p>You have been moved to the group of speakers. Now you can speak.</p>
                    </div>
                    <div class="close">
                        <i class="fal fa-times"></i>
                    </div>
                </div>-->
                <!--<div class="toast warning">
                    <div class="icono">
                        <i class="fal fa-hand-paper"></i>
                    </div>
                    <div>
                        <p>You have been moved to the group of speakers. Now you can speak.</p>
                    </div>
                    <div class="close">
                        <i class="fal fa-times"></i>
                    </div>
                </div>-->
                <!--<div class="toast error">
                    <div class="icono">
                        <i class="fal fa-hand-paper"></i>
                    </div>
                    <div>
                        <p>You have been moved to the group of speakers. Now you can speak.</p>
                    </div>
                    <div class="close">
                        <i class="fal fa-times"></i>
                    </div>
                </div>-->
                <!-- Toasts -->

                <div class="gridUsers">
                    <div v-if="!room.onlySound && owner" class="mainVideo">
                        <div>
                            <div class="foto">
                                <div class="marco">
                                    <video></video>
                                </div>
                                <!--<div class="circulo">
                                    <i class="far fa-microphone"></i>
                                </div>-->
                            </div>
                            <h4 v-if="owner">{{owner.user}}</h4>
                        </div>
                    </div>

                    <div v-for="speaker in audioOnlySpeakers" :key="speaker.id" 
                        v-bind:class="{'multiplexed': speaker.multiplexedId!=null || speaker.id==loginData.id ||  speaker.id==room.OwnerId,'hablando' : speaker.audioLevel>0.01,'muteado'  : speaker.muted}"
                        v-bind:style="{'--audio-level': speaker.audioLevel>0.01 ? speaker.audioLevel : 0}"
                    >
                        <div>
                        <div class="foto" :data-speakerid="speaker.id" v-bind:style="{'--luminosidad': (speaker.audioLevel>0.01 ? (50 - 50 * speaker.audioLevel ) : 50)+'%'}">
                            <div class="marco">
                                <img src="/assets/images/foto-lily.jpg" alt="Lily" class="img-fluid" />
                            </div>
                            <div class="circulo">
                                <i class="far fa-microphone"></i>
                            </div>
                        </div>
                        <h4>{{speaker.user}}</h4>
                        <span v-if="loginData.id == room.OwnerId && speaker.id != room.OwnerId">
                            <span @click="manageRequest(speaker.id, false)">Demote</span>
                        </span>
                        </div>
                    </div>
                </div>
                <div class="titular mt20 mb20">
                     <div>
                         <img src="/assets/images/ico-audience.svg" alt="audience" />
                     </div>
                     <div>
                         <h3>Audience <span>({{room.members.length}})</span></h3>
                     </div>
                </div>
                <div class="gridUsers audience">
                    <div v-for="member in room.members" :key="member.id" v-bind:class="{'raised-hand': member.pendingRequest}">
                         <div>
                             <div class="foto" >
                                 <div class="marco">
                                      <img src="/assets/images/foto-lily.jpg" alt="Lily" class="img-fluid" />
                                 </div>
                                 <div v-if="member.pendingRequest" class="circulo">
                                      <i class="far fa-hand-paper"></i>
                                 </div>
                             </div>
                             <h4>{{member.user}}</h4>
<!--
                             <span v-bind:class="{ 'pendingRequest': (member.pendingRequest != null && member.pendingRequest && (loginData.id == room.OwnerId || loginData.id == member.id)) }">
                                 <span v-if="loginData.id == room.OwnerId">
                                     <span @click="manageRequest(member.id, true)">Promote</span>
                                     <span v-if="member.pendingRequest != null && member.pendingRequest" @click="manageRequest(member.id, false)">Refuse</span>
                                 </span>
                             </span>
-->
                         </div>
                    </div>
                </div>
            </div>
            <div id="cntViewerTags" style="display:none">
            </div>
            <div class="faldonFooter">
                <div>
                    <button class="btn btn-dark" @click="$router.back()"><i class="far fa-sign-out marginright"></i>Leave room</button>
                </div>
                <div v-if="loginData.id == room.OwnerId && room.members != null && room.members.filter(f => f.pendingRequest != null && f.pendingRequest).length > 0">
                    <button class="btn btn-default btn-redondeado" @click="openRequestModal()">
                        <i class="far fa-handshake"></i>
                     </button>
                </div>
                <div v-if="publishing">
                    <button class="btn btn-default btn-redondeado" @click="toggleMute()">
                        <i class="far fa-microphone" v-if="!muted"></i>
                        <i class="far fa-microphone-alt-slash" v-else></i>
                      </button>
                </div>
                <div v-else>
                    <button class="btn btn-default btn-redondeado" @click="madeRequest(true)" v-if="loginData.id != room.OwnerId && (loginData.pendingRequest == null || loginData.pendingRequest == false) && room.speakers != null && room.speakers.filter(f => f.id == loginData.id).length == 0">
                      <i class="far fa-hand-paper"></i>
                    </button>
                    <button class="btn btn-default btn-redondeado" @click="madeRequest(false)" v-if="loginData.id != room.OwnerId && loginData.pendingRequest && room.speakers != null && room.speakers.filter(f => f.id == loginData.id).length == 0">
                      <i class="far fa-hand-paper"></i>
                    </button>
                </div>
            </div>
            <div class="trianguloAbsolute">
                <img src="/assets/images/triangle.svg" alt="triangle" />
            </div>
        </ion-content>
    </ion-page>
</template>
<script src="./rooms-form.ts" lang="ts"></script>
<style lang="scss">
  @import './rooms-form.scss';
</style>