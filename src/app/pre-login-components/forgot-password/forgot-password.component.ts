import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { initializeApp } from 'firebase/app';
import { Firestore } from '@angular/fire/firestore';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { getAuth, Auth, AuthError } from 'firebase/auth';
import { sendPasswordResetEmail } from 'firebase/auth';
import { getFirestore} from 'firebase/firestore';
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

  constructor(private router: Router) {
    const firebaseConfig = {
      apiKey: "AIzaSyDmu3sXXJKQu_H4grv8B-H8i5Bx3jbFmQc",
      authDomain: "da-bubble-9f879.firebaseapp.com",
      projectId: "da-bubble-9f879",
      storageBucket: "da-bubble-9f879.appspot.com",
      messagingSenderId: "872329683690",
      appId: "1:872329683690:web:21114e02f86b180bd52d93"
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

  resetPassword(): Promise<void> {
    if (!this.resetPasswordForm.valid) {
      this.resetPasswordFormError = 'Bitte geben Sie eine gültige E-Mail-Adresse ein.';
      return Promise.reject();
    }
    return sendPasswordResetEmail(this.auth, this.email);
  }
}