import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, Auth, UserCredential } from 'firebase/auth';
import { getFirestore, collection, addDoc, doc, setDoc } from 'firebase/firestore';

import { Firestore } from '@angular/fire/firestore';
@Injectable({
    providedIn: 'root'
})
export class AuthService {
  [x: string]: any;
  auth: Auth;
  firestore: Firestore
    userLoggedIn: boolean;      // other components can check on this variable for the login status of the user

    constructor(private router: Router, private afAuth: AngularFireAuth) {
        this.userLoggedIn = false;
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
        this.afAuth.onAuthStateChanged((user) => {              // set up a subscription to always know the login status of the user
            if (user) {
                this.userLoggedIn = true;
            } else {
                this.userLoggedIn = false;
            }
        });
    }

    loginUser(email: string, password: string): Promise<any> {
        return this.afAuth.signInWithEmailAndPassword(email, password)
            .then(() => {
                console.log('Auth Service: loginUser: success');
                 this.router.navigate(['/home']);
            })
            .catch(error => {
                console.log('Auth Service: login error...');
                console.log('error code', error.code);
                console.log('error', error);
                if (error.code !== undefined && error.code !== null) {
                  return { isValid: false, message: error.message };
                } else {
                  return { isValid: false, message: 'Unknown error occurred.' };
                }
              });
    }

    signupUser(user: any): Promise<any> {
      return this.afAuth.createUserWithEmailAndPassword(user.email, user.password)
        .then((result) => {
          let emailLower = user.email.toLowerCase();
          if (result.user) {
            result.user.sendEmailVerification(); // immediately send the user a verification email
          }
        })
        .catch(error => {
          console.log('Auth Service: signup error', error);
          if (error.code) {
            return { isValid: false, message: error.message };
          } else {
            return { isValid: false, message: 'Unknown error occurred.' };
          }
        });
    }

    resetPassword(email: string): Promise<void> {
      return this.afAuth.sendPasswordResetEmail(email);
    }
}
