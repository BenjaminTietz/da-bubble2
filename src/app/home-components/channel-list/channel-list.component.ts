import { Component, HostListener, inject, OnDestroy, OnInit } from '@angular/core';
import { query, orderBy, limit, where, Firestore, collection, doc, onSnapshot, addDoc, updateDoc, deleteDoc, setDoc, Unsubscribe } from '@angular/fire/firestore';
import { Channel } from '../../../models/channel.class';
import { User } from '../../../models/user.class';




@Component({
  selector: 'app-channel-list',
  templateUrl: './channel-list.component.html',
  styleUrl: './channel-list.component.scss'
})
export class ChannelListComponent implements OnDestroy, OnInit {

  public isScreenSmall!: boolean;
  drawerMode: 'side' | 'over' = 'side';
  drawerOpened: boolean = false;


  firestore: Firestore = inject(Firestore);
  //displayedColumns: string[] = ['position'];
  unsubChannels!: Unsubscribe;
  listChannels: any = [];
  channel = new Channel();

  user: User = new User();
  storedUserAuthUID: any;
  listUserChannels: any = [];
  godMode: boolean = false;


  constructor() {
    this.checkScreenSize();
    //this.unsubChannels = this.subChannelsList();

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
        this.listUserChannels = doc.data()['channels']
      })
      this.unsubChannels = this.subChannelsList();
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



  subChannelsList() {
    const q = query(this.getChannelsRef(), orderBy('chanName'));
    //const q = query(this.getChannelsRef(), where() orderBy('chanName'));
    return onSnapshot(q, (list) => {
      this.listChannels = [];
      list.forEach(element => {
        this.listChannels.push(this.setChannel(element.data(), element.id));
      });
    });
  }



  setChannel(obj: any, id: string,): Channel {
    return {
      id: id || "",
      chanName: obj.chanName || "",
      description: obj.description || "",
      creator: obj.creator || "",
      users: obj.users || [],
      posts: obj.posts || []
    }
  }

  getChannelsRef() {
    return collection(this.firestore, 'channels');
  }



  private checkScreenSize() {
    this.isScreenSmall = window.innerWidth < 850;
    this.drawerMode = this.isScreenSmall ? 'over' : 'side';
    this.drawerOpened = !this.isScreenSmall;
  }


  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize();
  }


  ngOnDestroy(): void {
    this.unsubChannels();
  }


  toggleGodmode() {
    this.godMode = !this.godMode;

  }


}
