import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Auth, confirmPasswordReset, getAuth } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { AuthService } from '../../services/auth.service';

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
    this.route.queryParams.subscribe(params => {
      const oobCode = params['oobCode'];
  
      if (oobCode) {
        // Hier könntest du weitere Überprüfungen durchführen oder direkt zur ResetPasswordComponent navigieren
        this.router.navigate(['/reset-password']);
      }
    });
  }

  resetPassword(): void {
    const oobCode = this.route.snapshot.queryParams['oobCode'];

    if (!oobCode) {
      // Handle fehlenden oobCode
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.resetPasswordError = 'Die Passwörter stimmen nicht überein.';
      return;
    }

    confirmPasswordReset(this.auth, oobCode, this.password)
      .then(() => {
        // Erfolgreich
        console.log('Passwort erfolgreich geändert');
        // Optional: Weiterleitung zur Anmeldeseite
        this.router.navigate(['/login']);
      })
      .catch((error) => {
        // Fehler behandeln
        console.error('Fehler beim Ändern des Passworts:', error.message);
        this.resetPasswordError = 'Fehler beim Ändern des Passworts. Bitte versuche es erneut.';
      });
  }
}
