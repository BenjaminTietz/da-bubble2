import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators, MinLengthValidator } from '@angular/forms';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, Auth, UserCredential } from 'firebase/auth';
import { getFirestore, collection, addDoc, doc, setDoc } from 'firebase/firestore';
import { User } from '../../../models/user.class';
import { Firestore } from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {
  signupForm!: FormGroup;
  firebaseErrorMessage: string;
  auth: Auth;
  firestore: Firestore;
  userId = '';
  user: User = new User();

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
    this.firebaseErrorMessage = '';
    this.auth = getAuth();
    this.firestore = getFirestore();
  }

  ngOnInit(): void {
    this.signupForm = new FormGroup({
      username: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
      acceptTerms: new FormControl(false, Validators.requiredTrue)
    });
  }

  async signup() {
    if (this.signupForm.valid) {
      const { username, email, password } = this.signupForm.value;

      try {
        const userCredential: UserCredential = await createUserWithEmailAndPassword(this.auth, email, password);

        // Hier erhältst du den UID des gerade erstellten Benutzers
        const authUID = userCredential.user.uid;

        // Erstelle ein Dokument in der Firestore-Datenbank mit Benutzerdaten
        const userDocRef = await addDoc(collection(this.firestore, 'users'), {
          authUID: authUID, // authUID im Feld authUID speichern
          name: username,
          status: '',
          photoURL: '',
          channels: []
        });

        // Extrahiere die ID aus dem userDocRef und aktualisiere das Dokument mit der ID
        const userId = userDocRef.id;
        await setDoc(doc(this.firestore, 'users', userId), { id: userId }, { merge: true });

        // Verwende die ID des erstellten Dokuments als ID im Benutzerobjekt
        const user = new User({
          authUID: authUID,
          id: userId,
          name: username,
          status: '',
          photoURL: '',
          channels: []
        });

        console.log('Signup successful!', userCredential);
        console.log('User document created with ID:', userId);

        // Navigiere zu einer anderen Komponente für die Auswahl des Avatars oder Hochladen eines Bildes
        console.log('User ID before navigation:', userId);
        this.router.navigate(['/choose-avatar', userId]);
      } catch (error: any) {
        console.error('Signup error:', error);

        const errorCode = error.code;
        const errorMessage = error.message;

        if (errorCode === 'auth/email-already-in-use') {
          this.firebaseErrorMessage = 'Die E-Mail-Adresse ist bereits registriert.';
        } else {
          this.firebaseErrorMessage = 'Unbekannter Fehler beim Anmelden.';
        }
      }
    }
  }
}