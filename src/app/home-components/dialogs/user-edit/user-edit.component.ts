import { Component, Inject, OnInit, inject } from '@angular/core';
import { User } from '../../../../models/user.class';
import { query, orderBy, limit, where, Firestore, collection, doc, getDoc, onSnapshot, addDoc, updateDoc, deleteDoc, setDoc, DocumentData, DocumentSnapshot, arrayUnion, FieldValue } from '@angular/fire/firestore';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';




@Component({
  selector: 'app-user-edit',
  templateUrl: './user-edit.component.html',
  styleUrl: './user-edit.component.scss'
})
export class UserEditComponent implements OnInit {

  user!: User;

  firestore: Firestore = inject(Firestore);

  newName!: string;
  newEmail!: string;


  constructor(
    public dialog: MatDialogRef<UserEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }


  ngOnInit(): void {
    this.newName = this.user.name;
    this.newEmail = this.user.email;

  }


  saveUserEdit() {
    console.log('save user')

    updateDoc(this.getDocRef(), {
      email: this.newEmail,
      name: this.newName
    })
    this.returnUserToProfile();
  }


  returnUserToProfile() {
    this.user.name = this.newName;
    this.user.email = this.newEmail;
    this.dialog.close(this.user);
  }


  getDocRef() {
    return doc(this.firestore, 'users', this.user.id);
  }






}
