import { Component, Inject, OnInit, inject } from '@angular/core';
import { User } from '../../../../models/user.class';
import {
  query,
  orderBy,
  limit,
  where,
  Firestore,
  collection,
  doc,
  getDoc,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  DocumentData,
  DocumentSnapshot,
  arrayUnion,
  FieldValue,
} from '@angular/fire/firestore';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { transformMenu } from '@angular/material/menu';
//Benötigt für die Validierung des Formulars
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { UserChangeAvatarComponent } from '../user-change-avatar/user-change-avatar.component';

@Component({
  selector: 'app-user-edit',
  templateUrl: './user-edit.component.html',
  styleUrl: './user-edit.component.scss',
})
export class UserEditComponent implements OnInit {
  user!: User;

  firestore: Firestore = inject(Firestore);

  newName!: string;
  newEmail!: string;

  //Benötigt für die Validierung des Formulars
  editUserForm!: FormGroup;
  loginError: string | null = null;
  storedUserAuthUID: any;

  constructor(
    public dialog: MatDialogRef<UserEditComponent>, public dialogNew: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.storedUserAuthUID = sessionStorage.getItem('userAuthUID');
    this.newName = this.user.name;
    this.newEmail = this.user.email;

    this.editUserForm = new FormGroup({
      name: new FormControl('', [Validators.required, Validators.minLength(3)]),
      email: new FormControl('', [Validators.required, Validators.email]),
    });

    this.editUserForm.patchValue({
      name: this.newName,
      email: this.newEmail,
    });

    this.editUserForm.valueChanges.subscribe((value) => {
      console.log('Formularwert geändert:', value);
    });
  }

  getUser() {
    let q;
    if (this.storedUserAuthUID) {
      q = query(
        this.getUsersRef(),
        where('authUID', '==', this.storedUserAuthUID)
      );
    } else {
      q = query(
        this.getUsersRef(),
        where('authUID', '==', this.storedUserAuthUID)
      ); // q = input für Gastzugang
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

  saveUserEdit() {
    const updatedName = this.editUserForm.get('name')?.value;
    const updatedEmail = this.editUserForm.get('email')?.value;
    const updatedAvatarUrl = this.user.avatarURL;

    updateDoc(this.getDocRef(), {
      email: updatedEmail,
      name: updatedName,
      avatarURL: updatedAvatarUrl
    })
      .then(() => {
        console.log('Dokument erfolgreich aktualisiert');
        this.newName = updatedName;
        this.newEmail = updatedEmail;
        this.updateUserInDetailComponent();
        this.returnUserToProfile();
      })
      .catch((error) => {
        console.error('Fehler beim Aktualisieren des Dokuments:', error);
      });
  }

  updateUserInDetailComponent() {
    this.getUser();
  }


  returnUserToProfile() {
    this.user.name = this.newName;
    this.user.email = this.newEmail;
    this.dialog.close(this.user);
  }

  getDocRef() {
    return doc(this.firestore, 'users', this.user.id);
  }





  openDialogChangeAvatar(user: any) {
    const dialog = this.dialogNew.open(UserChangeAvatarComponent);
    dialog.componentInstance.user = new User(user);


    dialog.afterClosed().subscribe(result => {
      this.user.avatarURL = result;
    })

  }









}
