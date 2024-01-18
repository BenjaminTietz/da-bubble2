import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { initializeApp } from 'firebase/app';
import { Firestore } from '@angular/fire/firestore';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { getAuth, Auth, AuthError } from 'firebase/auth';
import { sendPasswordResetEmail, updateEmail } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { User } from '../../../models/user.class';
@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
})
export class ForgotPasswordComponent implements OnInit {
  email: string = '';
  auth: Auth;
  firestore: Firestore;
  resetPasswordForm!: FormGroup;
  resetPasswordFormError: string | null = null;

  @ViewChild('popupDesktop') popupDesktop!: ElementRef;
  @ViewChild('popupMobile') popupMobile!: ElementRef;

  constructor(private router: Router) {
    const firebaseConfig = {
      apiKey: 'AIzaSyDmu3sXXJKQu_H4grv8B-H8i5Bx3jbFmQc',
      authDomain: 'da-bubble-9f879.firebaseapp.com',
      projectId: 'da-bubble-9f879',
      storageBucket: 'da-bubble-9f879.appspot.com',
      messagingSenderId: '872329683690',
      appId: '1:872329683690:web:21114e02f86b180bd52d93',
    };
    initializeApp(firebaseConfig);
    this.auth = getAuth();
    this.firestore = getFirestore();
  }

  ngOnInit(): void {
    this.resetPasswordForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
    });
  }

  resetPassword() {
    if (this.resetPasswordForm.valid) {
      this.email = this.resetPasswordForm.get('email')?.value;

      sendPasswordResetEmail(this.auth, this.email)
        .then(() => {

          
          console.log('Passwortrücksetzungs-E-Mail wurde gesendet');

          this.triggerPopup();
          setTimeout(() => {
            this.triggerPopup();
            this.router.navigate(['/login']);
          }, 3000);
        })
        .catch((error: AuthError) => {

          console.error(
            'Fehler beim Senden der Passwortrücksetzungs-E-Mail:',
            error.message
          );
        });
        this.resetPasswordForm.reset(); 
    }
  }


  triggerPopup() {
    let popupElementDesktop: HTMLElement = this.popupDesktop.nativeElement;
    let popupElementMobile: HTMLElement = this.popupMobile.nativeElement;
  
    // Check browser width and toggle between desktop and mobile popups
    if (window.innerWidth >= 700) {
      popupElementDesktop.classList.toggle('display-none');
    } else {
      popupElementMobile.classList.toggle('display-none');
    }
  }
}
