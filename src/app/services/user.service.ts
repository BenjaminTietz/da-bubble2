import { Injectable } from '@angular/core';
import { User } from '../../models/user.class';
import { Inject } from '@angular/core'; // Import the Inject decorator
import {
  getFirestore,
  Firestore,
  collection,
  query,
  where,
  getDocs,
  CollectionReference,
  DocumentData,
  addDoc,
  doc,
  DocumentReference,
  onSnapshot,
} from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { initializeApp } from 'firebase/app';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  storedUserAuthUID: any;
  user: User = new User();
  auth: Auth;
  firestore: Firestore;

  constructor() { 
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
    this.storedUserAuthUID = sessionStorage.getItem('userAuthUID');
 
    this.getUser();
  }

async getUser() {
  let q;
  if (this.storedUserAuthUID) {
    q = query(
      this.getUsersRef(),
      where('authUID', '==', this.storedUserAuthUID)
    );
    console.log('this.storedUserAuthUID is defined')
  } else {
    // Wenn this.storedUserAuthUID undefined ist, wird eine leere Abfrage erstellt
    q = query(
      this.getUsersRef()
    );
    console.log('this.storedUserAuthUID is undefined')
  }

  return onSnapshot(q, (docSnap: any) => {
    docSnap.forEach((doc: any) => {
      this.user = new User(this.setUserObject(doc.data()));
    });
  });
}

  getUsersRef() {
    return collection(this.firestore, 'users');
  }

  setUserObject(obj: any) {
    return {
      id: obj.id || '',
      authUID: obj.authUID || '',
      name: obj.name || '',
      status: obj.status || true,
      avatarURL: obj.avatarURL || '', 
      photoURL: obj.photoURL || '',
      channels: obj.channels || [],
      email: obj.email || '',
    };
  }

  getUserObjectForFirestore() {
    // Convert the User object to a plain JavaScript object
    return {
      id: this.user.id,
      authUID: this.user.authUID,
      name: this.user.name,
      status: this.user.status,
      avatarURL: this.user.avatarURL,
      photoURL: this.user.photoURL,
      channels: this.user.channels,
      email: this.user.email,
    };
  }

  getCurrentTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  getCurrentDate() {
    const now = new Date();
    const day = now.getDate().toString().padStart(2, '0');
    const month = (now.getMonth() + 1).toString().padStart(2, '0'); // Monate sind 0-indiziert
    const year = now.getFullYear();
    return `${day}.${month}.${year}`;
  }
}