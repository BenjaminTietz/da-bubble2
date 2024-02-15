import { Component, HostListener, inject, OnDestroy, OnInit } from '@angular/core';
import { query, orderBy, limit, where, Firestore, collection, doc, onSnapshot, addDoc, updateDoc, deleteDoc, setDoc, Unsubscribe } from '@angular/fire/firestore';
import { Channel } from '../../../models/channel.class';
import { User } from '../../../models/user.class';
import { UserService } from '../../services/user.service';




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
  userService: UserService = inject(UserService);

  //displayedColumns: string[] = ['position'];
  unsubChannels!: Unsubscribe;
  listChannels: any = [];
  channel = new Channel();

  user: User | null = null;
  storedUserAuthUID: any;
  listUserChannels: any = [];
  godMode: boolean = false;


  constructor() {
    this.checkScreenSize();
  }

  ngOnInit(): void {
    this.storedUserAuthUID = sessionStorage.getItem('userAuthUID');
    this.getUserWithService();
  }


  async getUserWithService() {
    this.user = await this.userService.getUser()
    this.listUserChannels = this.userService.listUserChannels;
    this.unsubChannels = this.subChannelsList();
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


  checkScreenSize() {
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
