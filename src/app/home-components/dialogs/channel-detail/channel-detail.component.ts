import { Component, OnInit, inject } from '@angular/core';
import { Channel } from '../../../../models/channel.class';
import { User } from '../../../../models/user.class';
import { MatDialog } from '@angular/material/dialog';
import { UserDetailComponent } from '../user-detail/user-detail.component';
import { query, orderBy, limit, where, Firestore, collection, doc, getDoc, onSnapshot, addDoc, updateDoc, deleteDoc, setDoc, DocumentData, DocumentSnapshot, arrayUnion, FieldValue } from '@angular/fire/firestore';


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




  constructor(public dialog: MatDialog) {

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
    console.log('Leave Channel:', this.channel.chanName)
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
