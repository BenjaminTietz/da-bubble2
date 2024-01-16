import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  Auth,
  signOut,
  signInWithEmailAndPassword,
  UserCredential,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  query,
  where,
  getDocs,
  addDoc,
} from 'firebase/firestore';
import { Firestore } from '@angular/fire/firestore';
import { sendPasswordResetEmail } from 'firebase/auth';
import { User } from '../../models/user.class';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  auth: Auth;
  firestore: Firestore;

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

  async login(email: string, password: string) {
    const auth = getAuth();
    const firestore = getFirestore();

    try {
      // Authentifiziere den Benutzer
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Holen Sie sich den Benutzer-UID
      const authUID = userCredential.user.uid;

      // Suche nach dem Dokument in der "users"-Sammlung mit der passenden "authUID"
      const usersCollectionRef = collection(firestore, 'users');
      const q = query(usersCollectionRef, where('authUID', '==', authUID));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // Das Dokument wurde gefunden
        querySnapshot.forEach(async (docSnap) => {
          // Extrahiere die ID aus dem gefundenen Dokument
          const userId = docSnap.data()['id'];

          // Verwende die ID als docRef
          const updatedUserDocRef = doc(firestore, 'users', userId);

          // Setze das Status-Feld auf true und aktualisiere das Dokument
          await setDoc(updatedUserDocRef, { status: true }, { merge: true });

          // Speichere authUID im session storage
          sessionStorage.setItem('userAuthUID', authUID);

          console.log('Login successful!');

          // Weiterleitung zur Home-Komponente
          this.router.navigate(['/home']);
        });
      } else {
        console.error('User document not found in users collection.');
      }
    } catch (error) {
      console.error('Login error:', error);
      // Füge hier die Logik für Fehlerbehandlung hinzu, z.B. Fehlermeldung anzeigen
    }
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
        console.error(
          'User document not found in users collection during logout.'
        );
      }
    } else {
      console.error('UserAuthUID not found in sessionStorage during logout.');
    }
  }

  resetPassword(email: string): Promise<void> {
    return sendPasswordResetEmail(this.auth, email);
  }

  async loginWithGoogle() {
    const auth = getAuth();
    const firestore = getFirestore();
  
    try {
      const provider = new GoogleAuthProvider();
      const result: UserCredential = await signInWithPopup(auth, provider);
  
      const user = result.user;
  
      // Überprüfe, ob der Benutzer bereits in der Datenbank existiert
      const usersCollectionRef = collection(firestore, 'users');
      const userQuery = await getDocs(
        query(usersCollectionRef, where('authUID', '==', user.uid))
      );
  
      if (userQuery.empty) {
        // Der Benutzer existiert noch nicht in der Datenbank
        const newUserDocRef = await addDoc(collection(firestore, 'users'), {
          authUID: user.uid,
          name: user.displayName || '',
          status: true, // Setze das Status-Feld auf true
          photoURL: user.photoURL || '',
          channels: [],
        });
  
        // Extrahiere die ID aus dem newUserDocRef und aktualisiere das Dokument mit der ID
        const userId = newUserDocRef.id;
        await setDoc(
          doc(firestore, 'users', userId),
          { id: userId },
          { merge: true }
        );
  
        // Speichere die Benutzerinformationen im session storage
        sessionStorage.setItem('userAuthUID', user.uid);
  
        console.log('Google login successful!');
        console.log('User document created with ID:', userId);
  
        // Navigiere zur ChooseAvatar-Komponente mit der Benutzer-ID
        this.router.navigate(['/choose-avatar', userId]);
      } else {

         // Speichere die Benutzerinformationen im session storage
         sessionStorage.setItem('userAuthUID', user.uid);
         
        // Der Benutzer existiert bereits in der Datenbank
        console.log('Google login successful!');
        console.log('User document already exists.');
  
        // Setze das Status-Feld auf true
        const existingUser: any = userQuery.docs[0].data();
        const userId = existingUser.id;
        const updatedUserDocRef = doc(firestore, 'users', userId);
        await setDoc(updatedUserDocRef, { status: true }, { merge: true });
  
        // Navigiere zur /home-Komponente mit der vorhandenen Benutzer-ID
        this.router.navigate(['/home']);
      }
  
      // Füge den Code hinzu, um den Benutzer weiterzuleiten oder andere Aktionen auszuführen
    } catch (error) {
      console.error('Google login error:', error);
      // Füge hier die Logik für Fehlerbehandlung hinzu, z.B. Fehlermeldung anzeigen
    }
  }
}
