<template>
    <ion-page id="pgRequestsModal">
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-button @click="closeModal()">
                        <ion-icon :icon="arrowBack"></ion-icon>
                    </ion-button>
                </ion-buttons>
                <ion-title>
                    Manage requests
                </ion-title>
            </ion-toolbar>
        </ion-header>
        <ion-content>

            <ion-list>
                <ion-item v-for="member in (room.members != undefined ? room.members.filter(f => f.pendingRequest != null && f.pendingRequest) : [])" :key="member.id">
                    {{member.user}} 
                    <span>
                        <span @click="manageRequest(member.id, true)">Promote</span>
                        <span @click="manageRequest(member.id, false)">Refuse</span>
                    </span>
                </ion-item>
            </ion-list>
        
        </ion-content>
        <ion-footer>
        </ion-footer>
    </ion-page>
</template>
<script src="./requests-modal.ts" lang="ts"></script>
<style>
  @import './requests-modal.scss';
</style>