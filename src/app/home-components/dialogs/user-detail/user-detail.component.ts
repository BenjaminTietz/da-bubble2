import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { User } from '../../../../models/user.class';
import { MatDialog } from '@angular/material/dialog';
import { UserEditComponent } from '../user-edit/user-edit.component';
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  CollectionReference,
  DocumentData,
  addDoc,
  doc,
  DocumentReference,
  orderBy,
  getDoc,
} from 'firebase/firestore';
import { Firestore, onSnapshot } from '@angular/fire/firestore';

@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrl: './user-detail.component.scss'
})
export class UserDetailComponent implements OnInit {

  user!: User;

  storedUserAuthUID: any;
  firestore: Firestore = inject(Firestore);

  constructor(public dialog: MatDialog) {

  }



  ngOnInit(): void {
    this.storedUserAuthUID = sessionStorage.getItem('userAuthUID');
    console.log(this.storedUserAuthUID)


    //this.getUser(); prüfen warum code eingefügt wurde...scheint nicht notwendig, da user immer übergeben wird
  }

  updateUser(name: string, email: string) {
    this.user.name = name;
    this.user.email = email;
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
      );
    }
  
    onSnapshot(q, (docSnap: any) => {
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


  openDialogEditUser(user: any) {
    const dialog = this.dialog.open(UserEditComponent, {
      position: {
        top: '32px',
        right: '32px'
      },
      maxWidth: '100%',
      panelClass: 'dialog-profile-detail'
    });
  
    dialog.componentInstance.user = new User(this.user);
    dialog.afterClosed().subscribe(result => {
      if (result) {
        this.getUser(); 
      }
    });
  }


}
