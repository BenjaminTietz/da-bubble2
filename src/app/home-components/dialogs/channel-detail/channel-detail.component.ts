import { Component, OnInit, inject } from '@angular/core';
import { Channel } from '../../../../models/channel.class';
import { User } from '../../../../models/user.class';
import { MatDialog } from '@angular/material/dialog';
import { UserDetailComponent } from '../user-detail/user-detail.component';
import { query, orderBy, limit, where, Firestore, collection, doc, getDoc, onSnapshot, addDoc, updateDoc, deleteDoc, setDoc, DocumentData, DocumentSnapshot, arrayUnion, arrayRemove, FieldValue } from '@angular/fire/firestore';
import { UserService } from '../../../services/user.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-channel-detail',
  templateUrl: './channel-detail.component.html',
  styleUrl: './channel-detail.component.scss'
})
export class ChannelDetailComponent implements OnInit {

  firestore: Firestore = inject(Firestore);

  channel!: Channel;

  editName: boolean = false;
  editDesc: boolean = false;

  newName: string = '';
  newDesc: string = '';

  user!: User;



  constructor(public dialog: MatDialog, private router: Router) {
  }



  ngOnInit(): void {
    this.newName = this.channel.chanName;
    this.newDesc = this.channel.description;
  }


  startEditName() {
    this.editName = true;
  }


  startEditDesc() {
    this.editDesc = true;
  }


  saveChannel() {
    if (this.newDesc && this.newName) {
      this.editName = false;
      this.editDesc = false;
      this.updateChannel();
      this.channel.chanName = this.newName;
      this.channel.description = this.newDesc;
    }

  }


  async updateChannel() {
    const docRef = doc(this.getChannelCollectionRef(), this.channel.id);
    await updateDoc(docRef, { chanName: this.newName, description: this.newDesc }).catch(
      (err) => { console.log(err); }
    ).then(
      () => { }
    );
  }


  getChannelCollectionRef() {
    return collection(this.firestore, 'channels')
  }


  leaveChannel() {
    this.deleteUserFromChannel();
  }


  deleteUserFromChannel() {
    deleteDoc(this.getUserInChannelDocRef(this.channel.id)).then(() => {
      this.deleteChannelFromUser();
    }).then(() => {
      this.dialog.closeAll();
      this.router.navigate(['/home']);
    })
  }


  getUserInChannelDocRef(chan_id: any) {
    return doc(this.firestore, 'channels', chan_id, 'users', this.user.id)
  }


  deleteChannelFromUser() {
    updateDoc(this.getUserRef(), {
      channels: arrayRemove(this.channel.id)
    })
  }


  getUserRef() {
    return doc(this.firestore, 'users', this.user.id)
  }


  deleteChannel() {
    console.log('Channel löschen')
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


}
