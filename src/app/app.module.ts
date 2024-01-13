import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getDatabase, provideDatabase } from '@angular/fire/database';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LoginComponent } from './pre-login-components/login/login.component';
import { SignupComponent } from './pre-login-components/signup/signup.component';
import { SelectAvatarComponent } from './pre-login-components/select-avatar/select-avatar.component';
import { ForgotPasswordComponent } from './pre-login-components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './pre-login-components/reset-password/reset-password.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    SignupComponent,
    SelectAvatarComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    provideFirebaseApp(() => initializeApp({"projectId":"da-bubble-9f879","appId":"1:872329683690:web:21114e02f86b180bd52d93","storageBucket":"da-bubble-9f879.appspot.com","apiKey":"AIzaSyDmu3sXXJKQu_H4grv8B-H8i5Bx3jbFmQc","authDomain":"da-bubble-9f879.firebaseapp.com","messagingSenderId":"872329683690"})),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideDatabase(() => getDatabase()),
    provideStorage(() => getStorage()),
    BrowserAnimationsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
