import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators, MinLengthValidator } from '@angular/forms';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
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
  }

  ngOnInit(): void {
    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),

    });
  }

  

  async login(email: string, password: string) {
    const auth = getAuth();
    const firestore = getFirestore();

    try {
      // Authentifiziere den Benutzer
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      // Holen Sie sich den Benutzer-UID
      const authUID = userCredential.user.uid;

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


  guestLogin() { }

  onSubmit() {
    if (this.loginForm.valid) {
      const email = this.loginForm.get('email')?.value;
      const password = this.loginForm.get('password')?.value;
      this.login(email, password);
    }
  }
}
