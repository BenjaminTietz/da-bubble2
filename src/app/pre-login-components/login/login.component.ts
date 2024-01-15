import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

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

  async login(email: string, password: string) {
    const auth = getAuth();
    const firestore = getFirestore();

    try {
      // Authentifiziere den Benutzer
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      // Holen Sie sich den Benutzer-UID und aktualisieren Sie den Status in der Firestore-Datenbank
      const authUID = userCredential.user.uid;
      await setDoc(doc(firestore, 'users', authUID), { status: true }, { merge: true });

      //Code Timo für session-storage:

      sessionStorage.setItem('userAuthUID', authUID)


      // Ende Code session-storage



      console.log('Login successful!');

      // Weiterleitung zur Home-Komponente
      this.router.navigate(['/home']);
    } catch (error) {
      console.error('Login error:', error);
      // Füge hier die Logik für Fehlerbehandlung hinzu, z.B. Fehlermeldung anzeigen
    }
  }

  onSubmit() {
    // Hier rufst du die login-Methode mit den E-Mail- und Passwortwerten aus dem Formular auf
    const email = (document.getElementById('email') as HTMLInputElement).value;
    const password = (document.getElementById('password') as HTMLInputElement).value;
    this.login(email, password);
  }
}
