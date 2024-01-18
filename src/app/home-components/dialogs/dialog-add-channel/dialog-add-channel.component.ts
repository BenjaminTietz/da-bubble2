import { Component, inject } from '@angular/core';
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
} from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-add-channel',
  templateUrl: './dialog-add-channel.component.html',
  styleUrl: './dialog-add-channel.component.scss',
})
export class DialogAddChannelComponent {
  channel: Channel = new Channel();
  formIncomplete: boolean = false; //muss später true sein
  loading: boolean = false;

  firestore: Firestore = inject(Firestore);

  constructor(public dialog: MatDialog) {}

  saveChannel() {
    this.loading = true;
    this.addChannel(this.setChannel(this.channel, ''), 'channels');
  }

  setChannel(obj: any, id: string): Channel {
    return {
      id: id || '',
      chanName: obj.chanName || '',
      description: obj.description || '',
      creator: obj.creator || '',
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
          this.updateChannelWithId(item, newID);
        });
    }
  }

  async updateChannelWithId(item: Channel, newId: any) {
    const docRef = doc(this.getChannelRef(), newId);
    await updateDoc(docRef, { id: newId })
      .catch((err) => {
        console.log(err);
      })
      .then(() => {});
  }

  getChannelRef() {
    return collection(this.firestore, 'channels');
  }

  closeDialog() {
    this.dialog.closeAll();
  }
}
