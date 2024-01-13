import { NgModule, inject } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { RouterModule } from '@angular/router';
// forms
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
//firebase
import { provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getDatabase, provideDatabase } from '@angular/fire/database';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';

import { initializeApp } from "firebase/app";

//pre-login components
import { LoginComponent } from './pre-login-components/login/login.component';
import { SignupComponent } from './pre-login-components/signup/signup.component';
import { SelectAvatarComponent } from './pre-login-components/select-avatar/select-avatar.component';
import { ForgotPasswordComponent } from './pre-login-components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './pre-login-components/reset-password/reset-password.component';

//post-login components


//services
import { AuthService } from './services/auth.service';

import { routes } from './app-routing.module';
import { ImprintComponent } from './legal-components/imprint/imprint.component';
import { PrivacyPolicyComponent } from './legal-components/privacy-policy/privacy-policy.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    SignupComponent,
    SelectAvatarComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
    ImprintComponent,
    PrivacyPolicyComponent
  ],
  imports: [
    BrowserModule,
    AngularFirestoreModule,
    BrowserAnimationsModule,
    AngularFireAuthModule,
    provideFirebaseApp(() => initializeApp({"projectId":"da-bubble-9f879","appId":"1:872329683690:web:21114e02f86b180bd52d93","storageBucket":"da-bubble-9f879.appspot.com","apiKey":"AIzaSyDmu3sXXJKQu_H4grv8B-H8i5Bx3jbFmQc","authDomain":"da-bubble-9f879.firebaseapp.com","messagingSenderId":"872329683690"})),
    provideAuth(() => getAuth()),
    provideDatabase(() => getDatabase()),
    provideStorage(() => getStorage()),
    RouterModule.forRoot(routes),
    FormsModule,
    ReactiveFormsModule,

  ],
  exports: [RouterModule],
  providers: [
    AuthService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { 

}