<template>
    <ion-page id="pgRoomsForm">
        <ion-header>
            <ion-toolbar>
                <ion-buttons>
                    <ion-back-button></ion-back-button>
                </ion-buttons>
                <ion-title>
                    Room {{room.name}}
                </ion-title>
            </ion-toolbar>
        </ion-header>
        <ion-content>

            <div id="cntPublisherTags">

            </div>

            <div id="cntViewerTags">

            </div>

            <ion-list>
                <ion-title>
                    Speakers
                </ion-title>
                <ion-item v-for="speaker in room.speakers" :key="speaker.appToken">
                    {{speaker.user}} 
                    <span v-if="loginData.appToken == room.OwnerId && speaker.appToken != room.OwnerId">
                        <span @click="manageRequest(speaker.appToken, false)">Demote</span>
                    </span>
                </ion-item>
            </ion-list>

            <ion-list>
                <ion-title>
                    Audience
                </ion-title>
                <ion-item v-for="member in room.members" :key="member.appToken">
                    <span v-bind:class="{ 'pendingRequest': (member.pendingRequest != null && member.pendingRequest && (loginData.appToken == room.OwnerId || loginData.appToken == member.appToken)) }">
                        {{member.user}} 
                        <span v-if="loginData.appToken == room.OwnerId">
                            <span @click="manageRequest(member.appToken, true)">Promote</span>
                            <span v-if="member.pendingRequest != null && member.pendingRequest" @click="manageRequest(member.appToken, false)">Refuse</span>
                        </span>
                    </span>
                </ion-item>
            </ion-list>

        </ion-content>   
             
        <ion-footer>

            <ion-button expand="full" @click="openRequestModal()" v-if="loginData.appToken == room.OwnerId && room.members != null && room.members.filter(f => f.pendingRequest != null && f.pendingRequest).length > 0">
                <ion-label>{{room.members.filter(f => f.pendingRequest != null && f.pendingRequest).length}} pending requests</ion-label>
            </ion-button>

            <ion-label v-if="loginData.appToken == room.OwnerId && room.members != null && room.members.filter(f => f.pendingRequest != null && f.pendingRequest).length == 0">No requests</ion-label>

            <ion-button expand="full" @click="madeRequest(true)" v-if="loginData.appToken != room.OwnerId && (loginData.pendingRequest == null || loginData.pendingRequest == false) && room.speakers != null && room.speakers.filter(f => f.appToken == loginData.appToken).length == 0">
                <ion-label>Made request</ion-label>
            </ion-button>

            <ion-button expand="full" @click="madeRequest(false)" v-if="loginData.appToken != room.OwnerId && loginData.pendingRequest && room.speakers != null && room.speakers.filter(f => f.appToken == loginData.appToken).length == 0">
                <ion-label>Cancel request</ion-label>
            </ion-button>

        </ion-footer>
    </ion-page>
</template>
<script src="./rooms-form.ts" lang="ts"></script>
<style lang="scss">
  @import './rooms-form.scss';
</style>