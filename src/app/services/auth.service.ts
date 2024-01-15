import { Component, Inject, Injectable, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators, MinLengthValidator } from '@angular/forms';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, Auth, UserCredential, signOut } from 'firebase/auth';
import { getFirestore, collection, addDoc, doc, setDoc, query, where, getDocs } from 'firebase/firestore';
import { Firestore } from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';
import { sendPasswordResetEmail } from 'firebase/auth';

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  auth: Auth;
  firestore: Firestore;


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

    async logout() {
      const authUID = sessionStorage.getItem('userAuthUID');
  
      if (authUID) {
        const auth = getAuth();
        const firestore = getFirestore();
  
        // Suche nach dem Dokument in der "users"-Sammlung mit der passenden "authUID"
        const guestsCollectionRef = collection(firestore, 'users');
        const q = query(guestsCollectionRef, where('authUID', '==', authUID));
        const querySnapshot = await getDocs(q);
  
        if (!querySnapshot.empty) {
          // Das Dokument wurde gefunden
          querySnapshot.forEach(async (docSnap) => {
            // Extrahiere die ID aus dem gefundenen Dokument
            const userId = docSnap.data()['id'];
  
            // Verwende die ID als docRef
            const updatedUserDocRef = doc(firestore, 'users', userId);
  
            // Setze das Status-Feld auf false und aktualisiere das Dokument
            await setDoc(updatedUserDocRef, { status: false }, { merge: true });
  
            console.log('Logout successful!');
  
            // Abmeldung bei Firebase Auth
            await signOut(auth);

            // Lösche authUID aus dem session storage
            sessionStorage.removeItem('userAuthUID');
  
            // Weiterleitung zur Login-Komponente
            this.router.navigate(['/login']);
          });
        } else {
          console.error('User document not found in users collection during logout.');
        }
      } else {
        console.error('UserAuthUID not found in sessionStorage during logout.');
      }
    }

    resetPassword(email: string): Promise<void> {
      return sendPasswordResetEmail(this.auth, email);
    }
}
