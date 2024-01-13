import { Component, HostListener, inject } from '@angular/core';
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
