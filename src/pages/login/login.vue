<template>
    <ion-page id="pgLogin">
        <!--<ion-header>
            <ion-toolbar>
                <ion-title>
                    Login
                </ion-title>
            </ion-toolbar>
        </ion-header>-->
        <ion-content>

            <div class="estructuraLogin">
                <div class="animaciones">
                    <div class="shape shape-five">
                        <i class="fal fa-circle"></i>
                    </div>
                    <div class="shape shape-four">
                        <i class="far fa-circle"></i>
                    </div>
                    <div class="shape shape-three">
                        <i class="fas fa-circle"></i>
                    </div>
                </div>
                <div class="boxFotos">
                    <img src="/assets/images/usuario-01.png" class="usuario01" alt="usuario" />
                    <img src="/assets/images/usuario-02.png" class="usuario02" alt="usuario" />
                    <img src="/assets/images/usuario-03.png" class="usuario03" alt="usuario" />
                    <img src="/assets/images/usuario-04.png" class="usuario04" alt="usuario" />
                    <img src="/assets/images/usuario-05.png" class="usuario05" alt="usuario" />
                </div>
                <div class="logo">
                    <img src="/assets/images/logo.svg" alt="logo" />
                </div>
                <div class="formulario">
                    <div class="mb20">
                        <div class="input-group mb-2">
                            <div class="input-group-prepend">
                                <div class="input-group-text">
                                    <i class="fas fa-user"></i>
                                </div>
                            </div>
                            <input type="text" class="form-control form-control-lg" placeholder="@Nickname" @input="user.username=$event.target.value" />
                        </div>
                        
                    </div>
                    <div>
                        <button class="btn btn-primary btn-lg w100 withIcon" @click="doLogin()">
                            <span>Join</span><i class="fal fa-arrow-right"></i>
                        </button>
                    </div>
                </div>
            </div>
            

            <div class="trianguloAbsolute">
                <img src="/assets/images/triangle.svg" alt="triangle" />
            </div>
            <div class="trianguloAbsoluteLeft">
                <img src="/assets/images/triangle-left.svg" alt="triangle left" />
            </div>
            
        </ion-content>
        <!--<ion-footer>
            <ion-button expand="full" @click="doLogin()">
                <ion-label>Login</ion-label>
            </ion-button>
        </ion-footer>-->
    </ion-page>
</template>
<script src="./login.ts" lang="ts"></script>
<style lang="scss">
  @import './login.scss';
</style>