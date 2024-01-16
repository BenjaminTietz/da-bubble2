import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Firestore } from '@angular/fire/firestore';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, Auth, UserCredential } from 'firebase/auth';
import { getFirestore, addDoc, setDoc, getDoc } from 'firebase/firestore';
import { collection, doc, updateDoc } from 'firebase/firestore';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-select-avatar',
  templateUrl: './select-avatar.component.html',
  styleUrls: ['./select-avatar.component.scss']
})
export class SelectAvatarComponent {
  auth: Auth;
  firestore: Firestore;
  username: string = '';
  selectedAvatarUrl: string = "";
  userId!: string;

  constructor(private router: Router, private route: ActivatedRoute) {
    const firebaseConfig = {
      apiKey: "AIzaSyDmu3sXXJKQu_H4grv8B-H8i5Bx3jbFmQc",
      authDomain: "da-bubble-9f879.firebaseapp.com",
      projectId: "da-bubble-9f879",
      storageBucket: "da-bubble-9f879.appspot.com",
      messagingSenderId: "872329683690",
      appId: "1:872329683690:web:21114e02f86b180bd52d93"
    };
    initializeApp(firebaseConfig);
    this.firestore = getFirestore();
    this.auth = getAuth();
    this.route.paramMap.subscribe(params => {
      const userId = params.get('userId');
      console.log('Received user ID:', userId);
    });
    this.route.paramMap.subscribe(params => {
      this.userId = params.get('userId')!;
      console.log('Received user ID:', this.userId);
      this.loadUsername();
    });
  }

  continue() {
    console.log('Weiter geklickt! Ausgewählter Avatar:', this.selectedAvatarUrl);

    if (this.userId && this.selectedAvatarUrl) {
      const userDocRef = doc(this.firestore, 'users', this.userId);
      updateDoc(userDocRef, { avatarURL: this.selectedAvatarUrl }).then(() => {
        console.log('Avatar-URL erfolgreich in der Firestore-Datenbank gespeichert.');
      }).catch(error => {
        console.error('Fehler beim Speichern der Avatar-URL:', error);
      });
    }

    this.router.navigate(['/login']);
  }

  selectAvatar(avatarFileName: string) {
    console.log('Avatar ausgewählt:', avatarFileName);
    this.selectedAvatarUrl = `../../../assets/img/${avatarFileName}`;
    console.log('Avatar-URL:', this.selectedAvatarUrl);
  }

  async loadUsername() {
    try {
      const userDocRef = doc(this.firestore, 'users', this.userId);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        this.username = userDocSnap.data()['name'] || "Unknown User";
      } else {
        console.error('User document not found.');
      }
    } catch (error) {
      console.error('Error loading username:', error);
    }
  }
}
