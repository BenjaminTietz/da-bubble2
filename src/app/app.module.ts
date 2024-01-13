import { NgModule, inject } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { RouterModule } from '@angular/router';
//firebase
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getDatabase, provideDatabase } from '@angular/fire/database';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AngularFireModule} from '@angular/fire/compat';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { Firestore } from '@angular/fire/firestore';
import firebase from 'firebase/compat';
import firebaseui from 'firebaseui';
//pre-login components
import { LoginComponent } from './pre-login-components/login/login.component';
import { SignupComponent } from './pre-login-components/signup/signup.component';
import { SelectAvatarComponent } from './pre-login-components/select-avatar/select-avatar.component';
import { ForgotPasswordComponent } from './pre-login-components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './pre-login-components/reset-password/reset-password.component';

//post-login components


//services


import { environment } from '../environments/environment';

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
    AngularFirestoreModule,
    BrowserAnimationsModule,
    provideFirebaseApp(() => initializeApp({"projectId":"da-bubble-9f879","appId":"1:872329683690:web:21114e02f86b180bd52d93","storageBucket":"da-bubble-9f879.appspot.com","apiKey":"AIzaSyDmu3sXXJKQu_H4grv8B-H8i5Bx3jbFmQc","authDomain":"da-bubble-9f879.firebaseapp.com","messagingSenderId":"872329683690"})),
    provideAuth(() => getAuth()),
    provideDatabase(() => getDatabase()),
    provideStorage(() => getStorage()),
    RouterModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { 

}
