import { Injectable, OnInit, inject } from '@angular/core';
import {
  getFirestore,
  Firestore,
  collection,
  query,
  where,
  getDocs,
  CollectionReference,
  DocumentData,
  addDoc,
  doc,
  DocumentReference,
  onSnapshot,
} from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { UserService } from './user.service';
import { User } from '../../models/user.class';
import { MatDialog } from '@angular/material/dialog';
import { UserDetailComponent } from '../home-components/dialogs/user-detail/user-detail.component';
import { Channel } from '../../models/channel.class';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class SearchService implements OnInit {


  userService: UserService = inject(UserService);
  user: User | null = null;


  searchTextfromStartConversation: string = '';
  searchTextfromHeader: string = '';
  searchActivefromStartConversation: boolean = false;
  searchActivefromHeader: boolean = false;

  userResults: any[] = [];
  channelResults: any[] = [];

  selectedUsers: any[] = [];
  firestore: Firestore;


  storedUserAuthUID: any;


  constructor(public dialog: MatDialog,private router: Router,) {
    const firebaseConfig = {
      apiKey: 'AIzaSyDmu3sXXJKQu_H4grv8B-H8i5Bx3jbFmQc',
      authDomain: 'da-bubble-9f879.firebaseapp.com',
      projectId: 'da-bubble-9f879',
      storageBucket: 'da-bubble-9f879.appspot.com',
      messagingSenderId: '872329683690',
      appId: '1:872329683690:web:21114e02f86b180bd52d93',
    };

    initializeApp(firebaseConfig);
    this.firestore = getFirestore();
    this.storedUserAuthUID = sessionStorage.getItem('userAuthUID');
   this.getUserWithService();

  }

  ngOnInit(): void {
    this.getUserWithService();
    
  }


  async getUserWithService() {
    this.user = await this.userService.getUser();
    console.log(this.user)
  }


  async search(searchSource: string) {
    let searchText: string;
    let searchActive: boolean;

    if (searchSource === 'header') {
        searchText = this.searchTextfromHeader;
        searchActive = searchText.trim().length > 0; 
        this.searchActivefromStartConversation = false; 
    } else if (searchSource === 'startConversation') {
        searchText = this.searchTextfromStartConversation;
        searchActive = searchText.trim().length > 0; 
        this.searchActivefromHeader = false; 
    } else {
        return; 
    }

    if (!searchText) { 
        searchActive = false; 
        this.searchActivefromStartConversation = false;
        this.searchActivefromHeader = false;
    }

    let searchTextLower = searchText.toUpperCase();

    if (searchTextLower.startsWith('@') && searchTextLower.length > 1) {
        searchActive = true;
        let username = searchTextLower.slice(1);
        await this.loadUserResults(username);
    } else if (searchTextLower.startsWith('#') && searchTextLower.length > 1) {
        searchActive = true;
        let channelName = searchTextLower.slice(1);
        await this.loadChannelResults(channelName);
    } else {
        this.clearSearchResults();
    }

    if (searchSource === 'header') {
        this.searchActivefromHeader = searchActive;
    } else if (searchSource === 'startConversation') {
        this.searchActivefromStartConversation = searchActive;
    }
}


 

  async loadUserResults(username: string) {
    let usersQuery;

    if (username.length >= 1) {

      usersQuery = query(
        collection(this.firestore, 'users'),
        where('name', '>=', username)
      );
    } else {

      usersQuery = query(
        collection(this.firestore, 'users'),
        where('name', '>=', username),
        where('name', '<', username + '\uf8ff')
      );
    }

    let usersSnapshot = await getDocs(usersQuery);
    this.userResults = usersSnapshot.docs.map((doc) => doc.data()) as any[];
    this.filterUserResults(username);
  }

  async loadChannelResults(channelName: string) {
    let channelsQuery;

    if (channelName.length >= 1) {

      channelsQuery = query(
        collection(this.firestore, 'channels'),
        where('chanName', '>=', channelName)
      );
    } else {

      channelsQuery = query(
        collection(this.firestore, 'channels'),
        where('chanName', '>=', channelName),
        where('chanName', '<', channelName + '\uf8ff')
      );
    }

    let channelsSnapshot = await getDocs(channelsQuery);
    this.channelResults = channelsSnapshot.docs.map((doc) => doc.data()) as any[];
    this.filterChannelResults(channelName);
  }

  filterChannelResults(channelName: string) {
    this.channelResults = this.channelResults.filter(
      (channel) => channel.chanName && channel.chanName.toLowerCase().includes(channelName.toLowerCase()) && this.user && this.user.channels.indexOf(channel.id) != -1);
  }

  filterUserResults(username: string) {
    this.userResults = this.userResults.filter(
        (user) => user.name && user.name.toLowerCase().includes(username.toLowerCase())
        && user.authUID !== this.storedUserAuthUID
    );
}



  clearSearchResults() {
    this.channelResults = [];
    this.userResults = [];
  }

  openDialogProfile(user: any): void {
    const dialog = this.dialog.open(UserDetailComponent, {
      position: {
        top: '32px',
        right: '32px',
      },
      maxWidth: '100%',
      panelClass: 'dialog-profile-detail',
    });
    dialog.componentInstance.user = new User(user);
  }

  redirectToChannel(selectedChannel : Channel) {
      const channelUrl = `/home/channels/${selectedChannel.id}`;
      this.router.navigate([channelUrl]);
      this.searchTextfromHeader = '';
      this.searchActivefromHeader = false; 
      this.clearSearchResults();
  }

}


