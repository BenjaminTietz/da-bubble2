import { Routes } from '@angular/router';
//pre-login components
import { LoginComponent } from './pre-login-components/login/login.component';
import { SignupComponent } from './pre-login-components/signup/signup.component';
import { ForgotPasswordComponent } from './pre-login-components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './pre-login-components/reset-password/reset-password.component';
import { SelectAvatarComponent } from './pre-login-components/select-avatar/select-avatar.component';

//post-login components

//guards
import { authGuard } from './services/auth.guard';
//services

//material

export const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: 'signup', component: SignupComponent },
    { path: 'login', component: LoginComponent },
    { path: 'choose-avatar', component: SelectAvatarComponent },
    { path: 'forgot-password', component: ForgotPasswordComponent },
    { path: 'reset-password', component: ResetPasswordComponent },
    { path: '**', component: LoginComponent}                            //catch all other routes and redirect to login
];
