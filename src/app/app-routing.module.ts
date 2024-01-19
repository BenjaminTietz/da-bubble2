import { Routes } from '@angular/router';
//pre-login components
import { LoginComponent } from './pre-login-components/login/login.component';
import { SignupComponent } from './pre-login-components/signup/signup.component';
import { ForgotPasswordComponent } from './pre-login-components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './pre-login-components/reset-password/reset-password.component';
import { SelectAvatarComponent } from './pre-login-components/select-avatar/select-avatar.component';
import { ImprintComponent } from './legal-components/imprint/imprint.component';
import { PrivacyPolicyComponent } from './legal-components/privacy-policy/privacy-policy.component';
import { HomeComponent } from './home-components/home/home.component';
import { ChannelsComponent } from './home-components/channels/channels.component';

//post-login components

//guards
import { AuthGuard } from './services/auth.guard';
import { PrivateMessagesComponent } from './home-components/private-messages/private-messages.component';
import { StartConversationComponent } from './home-components/start-conversation/start-conversation.component';
//services

//material

export const routes: Routes = [
  //pre-login components
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'signup', component: SignupComponent },
  { path: 'login', component: LoginComponent },
  { path: 'choose-avatar/:userId', component: SelectAvatarComponent },

  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'imprint', component: ImprintComponent },
  { path: 'privacy-policy', component: PrivacyPolicyComponent },
  // { path: '**', component: LoginComponent },                            //catch all other routes and redirect to login

  //post-login components

  {
    path: 'home', component: HomeComponent,
    children: [
      { path: 'channels/:id', component: ChannelsComponent },
      { path: 'private-messages/:id', component: PrivateMessagesComponent },
      { path: 'start-conversation', component: StartConversationComponent },
    ]
  },
  { path: 'home/:userId', component: HomeComponent },
];




export class RoutingModule { }
