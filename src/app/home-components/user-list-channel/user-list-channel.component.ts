import { Component, OnInit, inject } from '@angular/core';
import { Channel } from '../../../models/channel.class';
import { User } from '../../../models/user.class';
import { MatDialog } from '@angular/material/dialog';
import { AddUserToChannelComponent } from '../dialogs/add-user-to-channel/add-user-to-channel.component';
import { query, orderBy, limit, where, Firestore, collection, doc, getDoc, onSnapshot, addDoc, updateDoc, deleteDoc, setDoc, DocumentData, DocumentSnapshot, arrayUnion, FieldValue } from '@angular/fire/firestore';
import { UserDetailComponent } from '../dialogs/user-detail/user-detail.component';



@Component({
  selector: 'app-user-list-channel',
  templateUrl: './user-list-channel.component.html',
  styleUrl: './user-list-channel.component.scss'
})
export class UserListChannelComponent implements OnInit {

  firestore: Firestore = inject(Firestore);

  channel!: Channel;
  listUsersInChannel!: any;

  currentUser!: User;
  storedUserAuthUID: any;
  userDataloaded: boolean = false;

  constructor(public dialog: MatDialog) {

  }


  ngOnInit(): void {
    this.storedUserAuthUID = sessionStorage.getItem('userAuthUID');
    this.getUser();

  }


  openDialogUserDetail(user: any) {
    {
      const dialog = this.dialog.open(UserDetailComponent, {
        position: {
          top: '32px',
          right: '32px'
        },
        maxWidth: '100%',
        panelClass: 'dialog-profile-detail'

      });
      dialog.componentInstance.user = new User(user);
    }
  }


  getUser() {
    let q;
    if (this.storedUserAuthUID) {
      q = query(this.getUsersRef(), where("authUID", "==", this.storedUserAuthUID));
    } else {
      q = query(this.getUsersRef(), where("authUID", "==", this.storedUserAuthUID)); // q = input für Gastzugang
    }

    onSnapshot(q, (docSnap: any) => {
      docSnap.forEach((doc: any) => {
        this.currentUser = new User(this.setUserObject(doc.data()))
      });
      this.userDataloaded = true;
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
      avatarURL: obj.avatarURL || '', //code added by Ben
      photoURL: obj.photoURL || '',
      channels: obj.channels || [],
      email: obj.email || ''
    }
  }

  openDialogAddUserToChannel(channel: any) {
    const dialog = this.dialog.open(AddUserToChannelComponent);
    dialog.componentInstance.channel = new Channel(this.channel);
  }


  deleteUserFromList(user: any, event: MouseEvent) {
    event.stopPropagation();
    deleteDoc(doc(this.getUsersSubcollectionChannelsRef(), user.id));

  }


  getUsersSubcollectionChannelsRef() {
    return collection(this.firestore, 'channels', this.channel.id, 'users');
  }


}
