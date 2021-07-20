<template>
    <ion-page id="pgRoomsForm">
        <ion-header>
            <ion-toolbar>
                <ion-buttons>
                    <ion-back-button></ion-back-button>
                </ion-buttons>
                <ion-title>
                    Room
                </ion-title>
            </ion-toolbar>
        </ion-header>
        <ion-content>

            <div class="estructuraFlex">
                <div class="cabeceraInt flex">
                    <div>
                        <h2>{{room.name}}</h2>
                    </div>
                    <div>
                        <button class="btnMenuInterior">
                            <i class="far fa-ellipsis-h"></i>
                        </button>
                    </div>
                    
                </div>
                <div class="titular mb30">
                    <div>
                        <img src="/assets/images/ico-speaker.svg" alt="speaker" />
                    </div>
                    <div>
                        <h3>Speakers <span>({{room.speakers.length}})</span></h3>
                    </div>
                </div>
                <div class="gridSpeakers">
                    <div v-if="!room.onlySound" class="mainVideo hablando porEncima">
                        <video></video>
                        <h4 v-if="owner">{{owner.user}} {{owner.audioLevel}}</h4>
                    </div>
                    <div v-for="speaker in audioOnlySpeakers" :key="speaker.id" v-bind:class="[speaker.multiplexedId!=null || speaker.id==loginData.id ||  speaker.id==room.OwnerId ? 'multiplexed' : '', speaker.audioLevel>0.001 ? 'hablando' : '']" >
                        <div>
                            <div class="foto">
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
                    <!--<div class="hablando porEncima">
                        <div>
                            <div class="foto">
                                <div class="marco">
                                    <img src="/assets/images/foto-lily.jpg" alt="Lily" class="img-fluid" />
                                </div>
                                <div class="circulo">
                                    <i class="far fa-microphone"></i>
                                </div>
                            </div>
                            <h4>Bea</h4>
                        </div>
                    </div>-->
                </div>
                <div class="titular mb30">
                     <div>
                         <img src="/assets/images/ico-speaker.svg" alt="speaker" />
                     </div>
                     <div>
                         <h3>Audience <span>({{room.members.length}})</span></h3>
                     </div>
                </div>
                <div class="gridSpeakers">
                     <div v-for="member in room.members" :key="member.id">
                         <div>
                             <div class="foto">
                                 <div class="marco">
                                    <img src="/assets/images/foto-lily.jpg" alt="Lily" class="img-fluid" />
                                 </div>
                             </div>
                             <h4>{{member.user}}</h4>
                             <span v-bind:class="{ 'pendingRequest': (member.pendingRequest != null && member.pendingRequest && (loginData.id == room.OwnerId || loginData.id == member.id)) }">
                                 <span v-if="loginData.id == room.OwnerId">
                                     <span @click="manageRequest(member.id, true)">Promote</span>
                                     <span v-if="member.pendingRequest != null && member.pendingRequest" @click="manageRequest(member.id, false)">Refuse</span>
                                 </span>
                             </span>
                         </div>
                     </div>
                </div>
            </div>
            <div id="cntViewerTags" style="display:none">
            </div>
            <div class="trianguloAbsolute">
                <img src="/assets/images/triangle.svg" alt="triangle" />
            </div>
        </ion-content>   
             
        <ion-footer>
            <ion-button expand="full" @click="toggleMute()" v-if="publishing">
                <ion-label v-if="muted">Unmute</ion-label>
                <ion-label v-else>Mute</ion-label>
            </ion-button>
            <ion-button expand="full" @click="openRequestModal()" v-if="loginData.id == room.OwnerId && room.members != null && room.members.filter(f => f.pendingRequest != null && f.pendingRequest).length > 0">
                <ion-label>{{room.members.filter(f => f.pendingRequest != null && f.pendingRequest).length}} pending requests</ion-label>
            </ion-button>

            <ion-label v-if="loginData.id == room.OwnerId && room.members != null && room.members.filter(f => f.pendingRequest != null && f.pendingRequest).length == 0">No requests</ion-label>

            <ion-button expand="full" @click="madeRequest(true)" v-if="loginData.id != room.OwnerId && (loginData.pendingRequest == null || loginData.pendingRequest == false) && room.speakers != null && room.speakers.filter(f => f.id == loginData.id).length == 0">
                <ion-label>Made request</ion-label>
            </ion-button>

            <ion-button expand="full" @click="madeRequest(false)" v-if="loginData.id != room.OwnerId && loginData.pendingRequest && room.speakers != null && room.speakers.filter(f => f.id == loginData.id).length == 0">
                <ion-label>Cancel request</ion-label>
            </ion-button>

        </ion-footer>
    </ion-page>
</template>
<script src="./rooms-form.ts" lang="ts"></script>
<style lang="scss">
  @import './rooms-form.scss';
</style>