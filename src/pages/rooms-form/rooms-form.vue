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
        <ion-content v-if="room">

            <!-- Toasts -->
            <!-- Añadir slideDown para hacer aparecer -->
            <div v-if="isOwner && lastPendingRequestUser" class="toast success slideDown">
                <div class="sup">
                    <div class="icono">
                        <i class="fal fa-hand-paper"></i>
                    </div>
                    <div>
                        <p> The user {{lastPendingRequestUser.username}} has something to say. Invite as speaker?</p>
                    </div>
                    <div class="close" @click="closeMsgWindow();">
                        <i class="fal fa-times"></i>
                    </div>
                </div>
                <div class="action" v-if="isOwner">
                    <div>
                        <button class="btn btn-translucent" @click="promoteUser(lastPendingRequestUser.id, false)">Deny</button>
                    </div>
                    <div>
                        <button class="btn btn-light" @click="promoteUser(lastPendingRequestUser.id, true)">Allow to speak</button>
                    </div>
                </div>
            </div>

            <!-- Añadir slideDown para hacer aparecer -->
            <div class="toast success" v-bind:class="{'slideDown': promotedChanged}">
                <div class="sup">
                    <div class="icono">
                        <i class="fal fa-hand-paper"></i>
                    </div>
                    <div>
                      <p v-if="publishing">You have been moved to the group of speakers. Now you can speak.</p>
                      <p v-else>You have been moved to the group of viewers. Now you can't speak.</p>
                    </div>
                    <div class="close" @click="hidePromoted();">
                        <i class="fal fa-times"></i>
                    </div>
                </div>
            </div>
            <!-- Toasts -->

            <!-- Modales manuales-->
            <div v-if="isOwner && selectedUser && selectedUser.id in room.participants" class="modalManual" v-bind:class="{'hidden': !showManageUserWindow}">
                <div class="cuerpo">
                    <button class="icoClose" @click="showManageUserWindow = false;"><i class="far fa-times"></i></button>
                    <div class="cabeceraConFoto">
                        <div class="texto">
                          <h2>{{selectedUser.username}}</h2>
                        </div>
                        <div class="foto" v-bind:class="{'raised-hand': selectedUser.raisedHand}">
                            <img src="/assets/images/foto-lily.jpg" alt="{{selectedUser.username}}"  class="img-fluid" />
                            <div class="circulo" v-if="!room.speakers[selectedUser.id] && selectedUser.raisedHand">
                                  <i class="far fa-hand-paper"></i>
                             </div>
                        </div>
                    </div>
                    <div class="action action-full text-center">
                      <div class ="mt10">
                            <button class="btn btn-secondary" v-if="room.speakers[selectedUser.id]" @click="promoteUser(selectedUser.id, false)">Remove from speakers</button>
                            <button class="btn btn-secondary" v-else @click="promoteUser(selectedUser.id, true)">Move to speakers</button>
                        </div>
                        <div class="mt10" v-if="room.speakers[selectedUser.id] && !selectedUser.muted">
                            <button class="btn btn-secondary" @click="muteSpeaker(selectedUser.id)">Mute</button>
                        </div>
                        <div class="mt10">
                          <button class="btn btn-secondary" @click="kickUser(selectedUser.id)">Kick</button>
                        </div>
                    </div>
                </div>
            </div>
            <div v-if="isOwner" v-bind:class="{'modalManual': true, 'hidden': !showPendingRequestsList}">
                <div class="cuerpo">
                    <button class="icoClose" @click="showPendingRequestsList = false;"><i class="far fa-times"></i></button>
                    <div class="cabecera">
                        <div class="icono">
                            <img src="/assets/images/ico-mano-alzada.svg" alt="mano-alzada" />
                        </div>
                        <div class="texto">
                            <h2>List of raised hands</h2>
                            <p>Allow a member in the audience to become a speaker</p>
                        </div>
                    </div>
                    <div class="action">
                        <div v-if="!raisedHands">
                            <p>No one has raised a hand yet!</p>    
                        </div>
                        <div v-else class="gridInvitaciones">

                            <div class="tarjeta" v-for="member in audience.filter(f => f.raisedHand)" :key="member.id">
                                <div class="izquierda">
                                    <div>
                                        <div class="foto">
                                            <img src="/assets/images/foto-lily.jpg" alt="{{member.username}}" class="img-fluid" />
                                        </div>
                                        <div>
                                            <h4>{{member.username}}</h4>
                                        </div>
                                    </div>
                                </div>
                                <div class="derecha">
                                    <button class="btn btn-secondary btn-sm" @click="promoteUser(member.id, true)">Allow</button>
                                    <button class="btn btn-default btn-sm" @click="promoteUser(member.id, false)">Deny</button>
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
                        <h3>Speakers <span>({{Object.keys(room.speakers).length}})</span></h3>
                    </div>
                </div>

                <div class="gridUsers">
                    <div v-if="!room.audioOnly && owner" class="mainVideo" v-bind:class="{'muteado'  : owner.muted}">
                        <div>
                            <div class="foto">
                                <div class="marco">
                                    <video></video>
                                </div>
                                <div class="circulo" v-if="owner.muted">
                                    <i class="far fa-microphone-alt-slash"></i>
                                </div>
                            </div>
                            <h4 v-if="owner">{{owner.username}}</h4>
                        </div>
                    </div>
                    <div v-for="speaker in audioOnlySpeakers" :key="speaker.id" 
                        v-bind:class="{'multiplexed': speaker.multiplexedId!=null || speaker.id==$user.id ||  speaker.id==room.ownerId,'hablando' : speaker.audioLevel>0.01,'muteado'  : speaker.muted}"
                        v-bind:style="{'--audio-level': speaker.audioLevel>0.01 ? speaker.audioLevel : 0}"
                        @click="openUserWindow(speaker);"
                    >
                        <div>
                            <div class="foto" :data-speakerid="speaker.id" v-bind:style="{'--luminosidad': (speaker.audioLevel>0.01 ? Math.max((75 - 50 * speaker.audioLevel * 2 ),25) : 75)+'%'}">
                                <div class="marco">
                                    <img src="/assets/images/foto-lily.jpg" alt="{{speaker.username}}" class="img-fluid" />
                                </div>
                                <div class="circulo">
                                    <i v-if="!speaker.muted" class="far fa-microphone"></i>
                                    <i v-else class="far fa-microphone-alt-slash"></i>
                                </div>
                            </div>
                            <h4>{{speaker.username}}</h4>
                        </div>
                    </div>
                </div>
                <div class="titular mt20 mb20">
                     <div>
                         <img src="/assets/images/ico-audience.svg" alt="audience" />
                     </div>
                     <div>
                         <h3>Audience <span>({{Object.keys(audience).length}})</span></h3>
                     </div>
                </div>
                <div class="gridUsers audience">
                    <div class="muteado" v-for="member in audience" :key="member.id" v-bind:class="{'raised-hand': member.raisedHand}" @click="openUserWindow(member);">
                         <div>
                             <div class="foto" >
                                 <div class="marco">
                                      <img src="/assets/images/foto-lily.jpg" alt="{{speaker.username}}" class="img-fluid" />
                                 </div>
                                 <div v-if="member.raisedHand" class="circulo">
                                      <i class="far fa-hand-paper"></i>
                                 </div>
                             </div>
                             <h4>{{member.username}}</h4>
                         </div>
                    </div>
                </div>
            </div>
            <div id="cntViewerTags" style="display:none">
            </div>
            <div class="faldonFooter" v-if="us">
                <div>
                    <button class="btn btn-dark" @click="$router.back()"><i class="far fa-sign-out marginright"></i>Leave room</button>
                </div>
                <div>
                    <div class="right-buttons">
                        <div v-if="isOwner">
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
                        <div v-else v-bind:class="{'raised-hand': us.raisedHand}">
                            <button class="btn btn-default btn-redondeado" @click="raiseHand(!us.raisedHand)">
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