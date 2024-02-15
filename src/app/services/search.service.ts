import { Injectable } from '@angular/core';
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

@Injectable({
  providedIn: 'root'
})
export class SearchService {


  searchText: string = '';
  searchActive: boolean = false;

  userResults: any[] = [];
  channelResults: any[] = [];

  selectedUsers: any[] = [];
  firestore: Firestore;

  constructor() {    const firebaseConfig = {
    apiKey: 'AIzaSyDmu3sXXJKQu_H4grv8B-H8i5Bx3jbFmQc',
    authDomain: 'da-bubble-9f879.firebaseapp.com',
    projectId: 'da-bubble-9f879',
    storageBucket: 'da-bubble-9f879.appspot.com',
    messagingSenderId: '872329683690',
    appId: '1:872329683690:web:21114e02f86b180bd52d93',
  };

  initializeApp(firebaseConfig);
  this.firestore = getFirestore();
 }


 async search() {
  if (!this.searchText) {
    this.searchActive = false;
    this.clearSearchResults();
    this.selectedUsers = [];
    return;
  }


  if (this.searchText.startsWith('@') && this.searchText.length > 1) {
    this.searchActive = true;
    const username = this.searchText.slice(1); // Entferne '@' vom Anfang des Benutzernamens
    await this.loadUserResults(username);
  } else if (this.searchText.startsWith('#')&& this.searchText.length > 1) {
    // Wenn die Suche mit '#' beginnt, Channelsuche durchführen
    this.searchActive = true;
    const channelName = this.searchText.slice(1); // Entferne '#' vom Anfang des Channelnamens
    await this.loadChannelResults(channelName);
  } else {
    // Wenn weder '@' noch '#' vorhanden sind, leere die Suchergebnisse
    this.clearSearchResults();
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

  const usersSnapshot = await getDocs(usersQuery);
  this.userResults = usersSnapshot.docs.map((doc) => doc.data()) as any[];
  this.filterUserResults(username); 
}

async loadChannelResults(channelName: string) {
  let channelsQuery;

  if (channelName.length >= 1) {

    channelsQuery = query(
      collection(this.firestore, 'channels'),
      where('description', '>=', channelName)
    );
  } else {

    channelsQuery = query(
      collection(this.firestore, 'channels'),
      where('description', '>=', channelName),
      where('description', '<', channelName + '\uf8ff')
    );
  }

  const channelsSnapshot = await getDocs(channelsQuery);
  this.channelResults = channelsSnapshot.docs.map((doc) => doc.data()) as any[];
  this.filterChannelResults(channelName); 
}

filterChannelResults(channelName: string) {
  this.channelResults = this.channelResults.filter((channel) =>
    channel.description.includes(channelName)
  );
}

filterUserResults(username: string) {
  this.userResults = this.userResults.filter(
    (user) => user.name && user.name.toLowerCase().includes(username.toLowerCase())
  );
}

clearSearchResults() {
  this.channelResults = [];
  this.userResults = [];
}
}


