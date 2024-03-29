import { Injectable } from '@angular/core';
import { User } from '../../models/user.class';
import { Inject } from '@angular/core';
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

  listUserChannels: any = [];

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

    const querySnapshot = await getDocs(q);
    let user = null;
    querySnapshot.forEach((doc) => {
      const userData = doc.data();
      user = new User(this.setUserObject(userData));
      this.fillListUserChannels(userData);
    });
    
    return user;
  }


  fillListUserChannels(userData: any) {
    this.listUserChannels = userData['channels']
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

  async getUserObjectForFirestore() {
    const user = await this.getUser() as unknown as User; 
    if (user) {
      return {
        id: user.id,
        authUID: user.authUID,
        name: user.name,
        status: user.status,
        avatarURL: user.avatarURL,
        photoURL: user.photoURL,
        channels: user.channels,
        email: user.email,
      };
    }
    return null; 
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