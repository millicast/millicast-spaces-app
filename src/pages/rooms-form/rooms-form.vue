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
                        <h3>Speakers <span>(9)</span></h3>
                    </div>
                </div>
                <div class="gridSpeakers">
                    <div v-for="speaker in room.speakers" :key="speaker.appToken" class="hablando porEncima">
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
                            <span v-if="loginData.appToken == room.OwnerId && speaker.appToken != room.OwnerId">
                                <span @click="manageRequest(speaker.appToken, false)">Demote</span>
                            </span>
                        </div>
                    </div>
                    <div class="hablando porEncima">
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
                    </div>
                </div>
            </div>
            <div class="trianguloAbsolute">
                <img src="/assets/images/triangle.svg" alt="triangle" />
            </div>

            <div id="cntPublisherTags">

            </div>

            <div id="cntViewerTags">

            </div>
            
            

            <!--<ion-list>
                <ion-title>
                    Speakers
                </ion-title>
                <ion-item v-for="speaker in room.speakers" :key="speaker.id">
                    {{speaker.user}} 
                    <span v-if="loginData.id == room.OwnerId && speaker.id != room.OwnerId">
                        <span @click="manageRequest(speaker.id, false)">Demote</span>
                    </span>
                    <ion-label>{{speaker.audioLevel}}</ion-label>
                </ion-item>
            </ion-list>-->

            <ion-list>
                <ion-title>
                    Audience
                </ion-title>
                <ion-item v-for="member in room.members" :key="member.id">
                    <span v-bind:class="{ 'pendingRequest': (member.pendingRequest != null && member.pendingRequest && (loginData.id == room.OwnerId || loginData.id == member.id)) }">
                        {{member.user}} 
                        <span v-if="loginData.id == room.OwnerId">
                            <span @click="manageRequest(member.id, true)">Promote</span>
                            <span v-if="member.pendingRequest != null && member.pendingRequest" @click="manageRequest(member.id, false)">Refuse</span>
                        </span>
                    </span>
                </ion-item>
            </ion-list>

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