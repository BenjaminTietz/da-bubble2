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


//Sidenav
import {MatSidenavModule} from '@angular/material/sidenav';
//Mat-Icon
import {MatIconModule} from '@angular/material/icon';
//Toolbar
import {MatToolbarModule} from '@angular/material/toolbar';
//MatExpansion
import {MatExpansionModule} from '@angular/material/expansion';
//Tooltip
import {MatTooltipModule} from '@angular/material/tooltip';
//Mat-Card
import {MatCardModule} from '@angular/material/card';
//Mat-Button
import {MatButtonModule} from '@angular/material/button';
//Mat-Dialog
import {MatDialogModule} from '@angular/material/dialog';
//Mat-Menu
import { MatMenuModule } from '@angular/material/menu';
//Mat-Divider
import {MatDividerModule} from '@angular/material/divider';


// Emoji Picker
import { PickerComponent } from '@ctrl/ngx-emoji-mart';






//services
import { AuthService } from './services/auth.service';
import { UserService } from './services/user.service';

import { routes } from './app-routing.module';
import { ImprintComponent } from './legal-components/imprint/imprint.component';
import { PrivacyPolicyComponent } from './legal-components/privacy-policy/privacy-policy.component';
import { HeaderComponent } from './home-components/header/header.component';
import { NavbarComponent } from './home-components/navbar/navbar.component';
import { HomeComponent } from './home-components/home/home.component';
import { ChannelsComponent } from './home-components/channels/channels.component';
import { ChannelListComponent } from './home-components/channel-list/channel-list.component';
import { provideFirestore } from '@angular/fire/firestore';
import { getFirestore } from 'firebase/firestore';
import { DialogAddChannelComponent } from './home-components/dialogs/dialog-add-channel/dialog-add-channel.component';
import { UserDetailComponent } from './home-components/dialogs/user-detail/user-detail.component';
import { UserEditComponent } from './home-components/dialogs/user-edit/user-edit.component';
import { AddUserToChannelComponent } from './home-components/dialogs/add-user-to-channel/add-user-to-channel.component';
import { PmListComponent } from './home-components/pm-list/pm-list.component';
import { PrivateMessagesComponent } from './home-components/private-messages/private-messages.component';
import { StartConversationComponent } from './home-components/start-conversation/start-conversation.component';
import { DeleteAnswerComponent } from './home-components/dialogs/delete-answer/delete-answer.component';
import { DeletePostComponent } from './home-components/dialogs/delete-post/delete-post.component';
import { UserListChannelComponent } from './home-components/user-list-channel/user-list-channel.component';
import { ChannelDetailComponent } from './home-components/dialogs/channel-detail/channel-detail.component';
import { UserChangeAvatarComponent } from './home-components/dialogs/user-change-avatar/user-change-avatar.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    SignupComponent,
    SelectAvatarComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
    ImprintComponent,
    PrivacyPolicyComponent,
    HeaderComponent,
    NavbarComponent,
    HomeComponent,
    ChannelsComponent,
    ChannelListComponent,
    DialogAddChannelComponent,
    UserDetailComponent,
    UserEditComponent,
    AddUserToChannelComponent,
    PmListComponent,
    PrivateMessagesComponent,
    StartConversationComponent,
    DeleteAnswerComponent,
    DeletePostComponent,
    UserListChannelComponent,
    ChannelDetailComponent,
    UserChangeAvatarComponent
  ],
  imports: [
    BrowserModule,
    AngularFirestoreModule,
    BrowserAnimationsModule,
    AngularFireAuthModule,
    provideFirebaseApp(() => initializeApp({"projectId":"da-bubble-9f879","appId":"1:872329683690:web:21114e02f86b180bd52d93","storageBucket":"da-bubble-9f879.appspot.com","apiKey":"AIzaSyDmu3sXXJKQu_H4grv8B-H8i5Bx3jbFmQc","authDomain":"da-bubble-9f879.firebaseapp.com","messagingSenderId":"872329683690"})),
    provideFirestore(() => getFirestore()),
    provideAuth(() => getAuth()),
    provideDatabase(() => getDatabase()),
    provideStorage(() => getStorage()),
    RouterModule.forRoot(routes),
    FormsModule,
    ReactiveFormsModule,
    MatSidenavModule,
    MatIconModule,
    MatToolbarModule,
    MatExpansionModule,
    MatTooltipModule,
    MatCardModule,
    MatButtonModule,
    MatDialogModule,
    MatMenuModule,
    MatDividerModule,
    PickerComponent,
  ],
  exports: [RouterModule],
  providers: [
    AuthService,
    UserService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { 

}