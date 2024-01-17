import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { initializeApp } from 'firebase/app';
import { AuthService } from '../../services/auth.service';
import { delay } from 'rxjs';
import { getAuth, signInAnonymously } from 'firebase/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loginError: string | null = null;
  constructor(private router: Router, private AuthService: AuthService) {
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
    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),

    });

    let introWrapper = document.querySelector('.intro-wrapper') as HTMLElement;

    introWrapper?.addEventListener('animationend', () => {
      // Warten Sie mindestens 3 Sekunden, bevor Sie display: none setzen
      setTimeout(() => {
        introWrapper.style.display = 'none';
      }, 1800);
    });
  }

  async guestLogin() {
      let email = 'guest@guest.com';
      let password = '123456';

      try {
        this.loginError = null;
        await this.AuthService.login(email, password);
      } catch (error: any) {
        this.loginError = error.toString();
      }
  }

  async onSubmit() {
    if (this.loginForm.valid) {
      let email = this.loginForm.get('email')?.value;
      let password = this.loginForm.get('password')?.value;

      try {
        this.loginError = null;
        await this.AuthService.login(email, password);
      } catch (error: any) {
        this.loginError = error.toString();
      }
    }
  }

  loginWithGoogle() {
    this.AuthService.loginWithGoogle();
  }

}
