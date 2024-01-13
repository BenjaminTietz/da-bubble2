import { Component, HostListener, inject, OnDestroy } from '@angular/core';
import { query, orderBy, limit, where, Firestore, collection, doc, onSnapshot, addDoc, updateDoc, deleteDoc, setDoc } from '@angular/fire/firestore';
import { Channel } from '../../../models/channel.class';




@Component({
  selector: 'app-channel-list',
  templateUrl: './channel-list.component.html',
  styleUrl: './channel-list.component.scss'
})
export class ChannelListComponent implements OnDestroy {

  public isScreenSmall!: boolean;
  drawerMode: 'side' | 'over' = 'side';
  drawerOpened: boolean = false;


  firestore: Firestore = inject(Firestore);
  //displayedColumns: string[] = ['position'];
  unsubChannels;
  listChannels: any = [];
  channel = new Channel();



  constructor() {
    this.checkScreenSize();
    this.unsubChannels = this.subChannelsList();

  }



  subChannelsList() {
    const q = query(this.getChannelsRef());
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
      name: obj.name || "",
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



}
