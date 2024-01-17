import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Auth, confirmPasswordReset, getAuth } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { AuthService } from '../../services/auth.service';
import { User } from '../../../models/user.class';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  password: string = '';
  confirmPassword: string = '';
  resetPasswordError: string | null = null;
  auth: Auth;
  currentUser!: User;
  oobCode: string | null = null;
  resetPasswordForm!: FormGroup;
  
  constructor(private route: ActivatedRoute, private router: Router, private AuthService: AuthService) {
    this.auth = getAuth(); // Stelle sicher, dass getAuth() von firebase/auth importiert ist
    const firebaseConfig = {
      apiKey: "AIzaSyDmu3sXXJKQu_H4grv8B-H8i5Bx3jbFmQc",
      authDomain: "da-bubble-9f879.firebaseapp.com",
      projectId: "da-bubble-9f879",
      storageBucket: "da-bubble-9f879.appspot.com",
      messagingSenderId: "872329683690",
      appId: "1:872329683690:web:21114e02f86b180bd52d93"
    };
    initializeApp(firebaseConfig);
  }

  ngOnInit(): void {
    this.resetPasswordForm = new FormGroup({
      password: new FormControl('', [Validators.required]),
      confirmPassword: new FormControl('', [Validators.required]),
    });

    this.route.queryParams.subscribe((params: { [key: string]: string }) => {
      const oobCode = params['oobCode'];
    
      if (oobCode) {
        this.oobCode = oobCode;
        console.log('oobCode:', oobCode);
      }
    });
  }

  resetPassword(): void {
    if (this.resetPasswordForm.valid) {
      const passwordControl = this.resetPasswordForm.get('password');
      const confirmPasswordControl = this.resetPasswordForm.get('confirmPassword');
  
      if (passwordControl && confirmPasswordControl) {
        const password = passwordControl.value; // Hier das Passwort direkt aus dem Formular abrufen
  
        if (password !== confirmPasswordControl.value) {
          this.resetPasswordError = 'Die Passwörter stimmen nicht überein.';
          return;
        }
  
        confirmPasswordReset(this.auth, this.oobCode!, password)
          .then(() => {
            console.log('Passwort erfolgreich geändert');
            this.router.navigate(['/login']);
          })
          .catch((error) => {
            console.error('Fehler beim Ändern des Passworts:', error);
            this.resetPasswordError = 'Fehler beim Ändern des Passworts. Bitte versuche es erneut.';
          });
      }
    }
  }
}