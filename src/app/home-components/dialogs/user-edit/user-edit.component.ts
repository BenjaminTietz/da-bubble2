import { Component, OnInit, inject } from '@angular/core';
import { User } from '../../../../models/user.class';
import { query, orderBy, limit, where, Firestore, collection, doc, getDoc, onSnapshot, addDoc, updateDoc, deleteDoc, setDoc, DocumentData, DocumentSnapshot, arrayUnion, FieldValue } from '@angular/fire/firestore';




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


  }


  getDocRef() {
    return doc(this.firestore, 'users', this.user.id);
  }






}
