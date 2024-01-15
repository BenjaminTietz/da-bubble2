import { Component, OnInit, inject } from '@angular/core';
import { User } from '../../../models/user.class';
import { query, orderBy, limit, where, Firestore, collection, doc, getDoc, onSnapshot, addDoc, updateDoc, deleteDoc, setDoc, DocumentData, DocumentSnapshot, arrayUnion, FieldValue } from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';
import { UserDetailComponent } from '../dialogs/user-detail/user-detail.component';




@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {

  firestore: Firestore = inject(Firestore);

  user: User = new User();
  storedUserAuthUID: any;


constructor(public dialog: MatDialog) {
  
}


  ngOnInit(): void {
    this.storedUserAuthUID = sessionStorage.getItem('userAuthUID');
    this.getUser();
  }


  getUser() {
    let q;
    if (this.storedUserAuthUID) {
      q = query(this.getUsersRef(), where("authUID", "==", this.storedUserAuthUID));
    } else {
      q = query(this.getUsersRef(), where("authUID", "==", this.storedUserAuthUID)); // q = input für Gastzugang
    }

    return onSnapshot(q, (docSnap: any) => {
      docSnap.forEach((doc: any) => {
        this.user = new User(this.setUserObject(doc.data()))
      })
    })
  }


  getUsersRef() {
    return collection(this.firestore, 'users');
  }


  setUserObject(obj: any) {
    return {
      id: obj.id || "",
      authUID: obj.authUID || "",
      name: obj.name || "",
      status: obj.status || true,
      photoURL: obj.photoURL || '',
      channels: obj.channels || [],
    }
  }




  openDialogProfile() {
    console.log('Open Profile')
    const dialog = this.dialog.open(UserDetailComponent);
    dialog.componentInstance.user = new User(this.user);

  }

  logout() {
    console.log('logout')
  }




}
