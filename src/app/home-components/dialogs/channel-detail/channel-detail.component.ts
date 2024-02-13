import { Component, OnInit, inject } from '@angular/core';
import { Channel } from '../../../../models/channel.class';
import { User } from '../../../../models/user.class';
import { MatDialog } from '@angular/material/dialog';
import { UserDetailComponent } from '../user-detail/user-detail.component';
import { query, orderBy, limit, where, Firestore, collection, doc, getDoc, onSnapshot, addDoc, updateDoc, deleteDoc, setDoc, DocumentData, DocumentSnapshot, arrayUnion, arrayRemove, FieldValue, getDocs } from '@angular/fire/firestore';
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

  wantToDelete: boolean = false;
  counting!: number;
  intervalCountDown!: any;



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


  startDeleteChannel() {
    this.stopCountDown();
    console.log('Channel löschen:', this.channel.id)
    this.deleteChannel();
  }


  deleteChannel() {
    deleteDoc(doc(this.firestore, 'channels', this.channel.id)).then(() => {
      this.deleteChannelFromAllUsers();
    })
  }


  async deleteChannelFromAllUsers() {
    const q = query(collection(this.firestore, 'users')); // Erstellt eine Query für die users-Collection
    const querySnapshot = await getDocs(q); // Führt die Query aus und holt die Dokumente

    querySnapshot.forEach((doc) => {
      const userRef = doc.ref; // Referenz auf das aktuelle Dokument/Benutzer
      updateDoc(userRef, {
        channels: arrayRemove(this.channel.id) // Entfernt den Channel aus dem channels-Array
      }).then(() => {
        //console.log(`Channel entfernt für Benutzer ${doc.id}`);
        this.dialog.closeAll();
        this.router.navigate(['/home']);
      }).catch((error) => {
        //console.error(`Fehler beim Entfernen des Channels für Benutzer ${doc.id}: `, error);
      });
    });
  }


  checkDelete() {
    console.log('Wechsel zu really delete')
    this.wantToDelete = true;
    this.counting = 5;
    this.startCountdown();
  }


  startCountdown() {
    this.intervalCountDown = setInterval(() => {
      if (this.counting > 0) {
        this.counting -= 1;
      } else {
        this.stopCountDown();
      }
    }, 1000);
  }


  stopCountDown() {
    clearInterval(this.intervalCountDown);
    this.wantToDelete = false;
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
