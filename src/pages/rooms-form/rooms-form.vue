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

            <!-- Toasts -->
            <!-- Añadir slideDown para hacer aparecer -->
            <div v-bind:class="{'toast': true, 'success': true, 'slideDown': showMsgWindow}">
                <div class="sup">
                    <div class="icono">
                        <i class="fal fa-hand-paper"></i>
                    </div>
                    <div>
                        <p v-if="LastPendingRequestUser.id != loginData.id">The user {{LastPendingRequestUser.user}} has something to say. Invite as speaker?</p>
                        <p v-if="LastPendingRequestUser.id == loginData.id && LastPendingRequestUser.id != room.OwnerId && room.speakers != undefined && room.speakers.filter(f => f.id == LastPendingRequestUser.id).length > 0">You have been moved to the group of speakers. Now you can speak.</p>
                        <p v-if="LastPendingRequestUser.id == loginData.id && LastPendingRequestUser.id != room.OwnerId && room.members != undefined && room.members.filter(f => f.id == LastPendingRequestUser.id).length > 0">You have been moved to the group of viewers. Now you can't speak.</p>
                    </div>
                    <div class="close" @click="closeMsgWindow();">
                        <i class="fal fa-times"></i>
                    </div>
                </div>
                <div class="action" v-if="loginData.id == room.OwnerId">
                    <div>
                        <button class="btn btn-translucent" @click="manageRequest(LastPendingRequestUser.id, false)">Deny</button>
                    </div>
                    <div>
                        <button class="btn btn-light" @click="manageRequest(LastPendingRequestUser.id, true)">Allow to speak</button>
                    </div>
                </div>
            </div>
            <!-- Toasts -->

            <!-- Modales manuales-->
            <div class="modalManual" v-bind:class="{'modalManual': true, 'hidden': !showManageUserWindow}">
                <div class="cuerpo">
                    <button class="icoClose" @click="showManageUserWindow = false;"><i class="far fa-times"></i></button>
                    <div class="cabeceraConFoto">
                        <div class="foto">
                            <img src="/assets/images/usuario-01.png" alt="ejemplo" />
                            <div class="circulo">
                                  <i class="far fa-hand-paper"></i>
                             </div>
                        </div>
                        <div class="texto">
                            <h2>{{SelectedUser.user}}</h2>
                        </div>
                    </div>
                    <div class="action text-center">
                        <div>
                            <button class="btn btn-secondary" v-if="room.members != undefined && room.members.filter(f => f.id == SelectedUser.id).length > 0" @click="manageRequest(SelectedUser.id, true)">Move to speakers</button>
                            <button class="btn btn-secondary" v-if="room.speakers != undefined && room.speakers.filter(f => f.id == SelectedUser.id).length > 0" @click="manageRequest(SelectedUser.id, false)">Move to viewers</button>
                        </div>
                        <div class="mt10">
                            <button class="btn btn-default" @click="ejectFromRoom(SelectedUser.id)">Eject from the room</button>
                        </div>
                        <div class="mt10" v-if="room.speakers != undefined && room.speakers.filter(f => f.id == SelectedUser.id).length > 0">
                            <button class="btn btn-default" @click="muteSpeaker(SelectedUser.id)">Mute speaker</button>
                        </div>
                    </div>
                </div>
            </div>
            <div v-bind:class="{'modalManual': true, 'hidden': !showPendingRequestsList}">
                <div class="cuerpo">
                    <button class="icoClose" @click="showPendingRequestsList = false;"><i class="far fa-times"></i></button>
                    <div class="cabecera">
                        <div class="icono">
                            <img src="/assets/images/ico-mano-alzada.svg" alt="mano-alzada" />
                        </div>
                        <div class="texto">
                            <h2>List of raised hands</h2>
                            <p>Open to everyone</p>
                        </div>
                    </div>
                    <div class="action">
                        <div v-if="room.members != undefined && room.members.filter(f => f.pendingRequest != null && f.pendingRequest).length == 0">
                            <p>No one has raised their hand yet!</p>    
                        </div>
                        <div class="gridInvitaciones">

                            <div class="tarjeta" v-for="member in (room.members != undefined ? room.members.filter(f => f.pendingRequest != null && f.pendingRequest) : [])" :key="member.id">
                                <div class="izquierda">
                                    <div>
                                        <div class="foto">
                                            <img src="/assets/images/usuario-01.png" alt="ejemplo" />
                                        </div>
                                        <div>
                                            <h4>@{{member.user}}</h4>
                                        </div>
                                    </div>
                                </div>
                                <div class="derecha">
                                    <button class="btn btn-secondary btn-sm" @click="manageRequest(member.id, true)">Allow</button>
                                    <button class="btn btn-default btn-sm" @click="manageRequest(member.id, false)">Deny</button>
                                </div>
                            </div>
                            
                        </div>
                    </div>
                </div>
            </div>
            <!-- Modales manuales-->

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
                        @click="openUserWindow(speaker);"
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
                    <div class="muteado" v-for="member in room.members" :key="member.id" v-bind:class="{'raised-hand': member.pendingRequest}" @click="openUserWindow(member);">
                         <div>
                             <div class="foto" >
                                 <div class="marco">
                                      <img src="/assets/images/foto-lily.jpg" alt="Lily" class="img-fluid" />
                                 </div>
                                 <div v-if="member.pendingRequest" class="circulo">
                                      <i class="far fa-hand-paper"></i>
                                 </div>
                                <div class="circulo">
                                    <i class="far fa-microphone"></i>
                                </div>
                             </div>
                             <h4>{{member.user}}</h4>
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
                <div>
                    <div class="right-buttons">
                        <div v-if="loginData.id == room.OwnerId && room.members != null && room.members.filter(f => f.pendingRequest != null && f.pendingRequest).length > 0">
                            <button class="btn btn-default btn-redondeado" @click="showPendingRequestsList = true;">
                                <i class="far fa-handshake"></i>
                            </button>
                        </div>
                        <div v-if="publishing">
                            <button class="btn btn-default btn-redondeado" v-bind:class="[muted ? 'btn-default' : 'btn-primary']" @click="toggleMute()">
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