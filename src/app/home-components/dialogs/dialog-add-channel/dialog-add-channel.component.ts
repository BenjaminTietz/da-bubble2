import { Component, OnInit, inject } from '@angular/core';
import { Channel } from '../../../../models/channel.class';
import {
  query,
  orderBy,
  limit,
  where,
  Firestore,
  collection,
  doc,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  DocumentReference,
  arrayUnion
} from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';
import { User } from '../../../../models/user.class';

@Component({
  selector: 'app-dialog-add-channel',
  templateUrl: './dialog-add-channel.component.html',
  styleUrl: './dialog-add-channel.component.scss',
})
export class DialogAddChannelComponent implements OnInit {

  channel: Channel = new Channel();
  formIncomplete: boolean = false; //muss später true sein
  loading: boolean = false;

  firestore: Firestore = inject(Firestore);
  storedUserAuthUID: any;
  user: User = new User();


  constructor(public dialog: MatDialog) { }

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
      avatarURL: obj.avatarURL || '',  // code added Ben
      photoURL: obj.photoURL || '',
      channels: obj.channels || [],
      email: obj.email || ''
    }
  }



  saveChannel() {
    this.loading = true;
    this.addChannel(this.setChannel(this.channel, ''), 'channels');
  }

  setChannel(obj: any, id: string): Channel {
    return {
      id: id || '',
      chanName: obj.chanName || '',
      description: obj.description || '',
      creator: this.setUserObject(this.user) || '',
      users: obj.users || [],
      posts: obj.posts || [],
    };
  }

  async addChannel(item: Channel, colId: 'channels') {
    if (colId == 'channels') {
      await addDoc(this.getChannelRef(), item)
        .catch((err) => {
          console.error(err);
        })
        .then((docRef) => {
          this.loading = false;
          const newID = docRef?.id;
          this.updateChannelWithId(newID);
        });
    }
  }

  async updateChannelWithId(newId: any) {
    const docRef = doc(this.getChannelRef(), newId);
    await updateDoc(docRef, { id: newId })
      .catch((err) => {
        console.log(err);
      })
      .then(() => {
        this.addCreatorToChannel(newId);
      });
  }
  

  addCreatorToChannel(chan_id: any) {
    setDoc(this.getUserInChannelSubcollectionRef(chan_id, this.user), this.setUserForSubcollectionInChannel(this.user)).then(() => {
      updateDoc(this.getUserDocRef(this.user), { channels: arrayUnion(chan_id) })
    })
  }


  getUserDocRef(user: any) {
    return doc(this.firestore, 'users', user.id)
  }


  setUserForSubcollectionInChannel(obj: any) {
    return {
      id: obj.id || "",
      authUID: obj.authUID || "",
    }
  }


  getUserInChannelSubcollectionRef(chan_id: any, user: any) {
    return doc(this.firestore, 'channels', chan_id, 'users', user.id)
  }


  getChannelRef() {
    return collection(this.firestore, 'channels');
  }

  closeDialog() {
    this.dialog.closeAll();
  }






}
