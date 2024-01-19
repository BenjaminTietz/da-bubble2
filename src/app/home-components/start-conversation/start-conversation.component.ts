import { Component, OnInit } from '@angular/core';
import { getFirestore, Firestore, collection, query, where, getDocs, CollectionReference, DocumentData, addDoc, doc, DocumentReference } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { Router } from '@angular/router';
import { onChildMoved } from 'firebase/database';
import { Chat } from '../../../models/chat.class';
import { User } from '../../../models/user.class';
import { updateDoc } from 'firebase/firestore';


@Component({
  selector: 'app-start-conversation',
  templateUrl: './start-conversation.component.html',
  styleUrls: ['./start-conversation.component.scss']
})
export class StartConversationComponent implements OnInit {

  searchText: string = '';
  channelResults: any[] = [];
  userResults: any[] = [];
  auth: Auth;
  firestore: Firestore;

  constructor(private router: Router) {
    const firebaseConfig = {
      apiKey: 'AIzaSyDmu3sXXJKQu_H4grv8B-H8i5Bx3jbFmQc',
      authDomain: 'da-bubble-9f879.firebaseapp.com',
      projectId: 'da-bubble-9f879',
      storageBucket: 'da-bubble-9f879.appspot.com',
      messagingSenderId: '872329683690',
      appId: '1:872329683690:web:21114e02f86b180bd52d93',
    };

    initializeApp(firebaseConfig);
    this.auth = getAuth();
    this.firestore = getFirestore();
  }
  ngOnInit() {
    this.loadUserResults();
    this.loadChannelResults();
  }

  // Initialize the search results and load the user and channel results local arrays

  async loadUserResults() {
    const usersQuery = query(collection(this.firestore, 'users'));
    const usersSnapshot = await getDocs(usersQuery);
    this.userResults = usersSnapshot.docs.map(doc => doc.data()) as any[];
    console.log(this.userResults);
  }

  async loadChannelResults() {
    const channelsQuery = query(collection(this.firestore, 'channels'));
    const channelsSnapshot = await getDocs(channelsQuery);
    this.channelResults = channelsSnapshot.docs.map(doc => doc.data()) as any[];
  }

  // Search for users and channels via @ and # respectively

  search() {
    if (this.searchText.startsWith('#')) {
      const channelName = this.searchText.slice(1);
      this.filterChannelResults(channelName);
    } else if (this.searchText.startsWith('@')) {
      const username = this.searchText.slice(1);
      this.filterUserResults(username);
    }
  }

  filterChannelResults(channelName: string) {
    this.channelResults = this.channelResults.filter(channel => channel.description.includes(channelName));
  }

  filterUserResults(username: string) {
    this.userResults = this.userResults.filter(user => user.name && user.name.includes(username));
  }

  // Create a private chat with the selected users

  async createPrivateChat() {
    const userId = "0qlW3ZW5a5pR0tFCdSoE"; // Der Benutzer, der den Chat erstellt

    // Declare the chatDoc variable
    let chatDoc: any;

    // Get the chat document
    const chatId = chatDoc.id; // Hier die chatId aus dem Dokument extrahieren

    // Füge weitere Benutzer zum Chat hinzu
    const additionalUserIds = ["UserId2", "UserId3"]; // Beispiel-IDs, ersetze sie durch die tatsächlichen Benutzer-IDs
    const privateChat: Chat = {
      participants: [],
      id: '',
      messages: []
    }; // Replace 'Chat' with the actual type of the chat object
  
    
    additionalUserIds.forEach(userId => {
      const user: User = {
        id: userId,
        authUID: '',
        name: '',
        status: false,
        avatarURL: '',
        photoURL: '',
        channels: [],
        email: ''
      }; // Replace 'User' with the actual type of the user object
      privateChat.participants.push(user);
    });
  
    // Aktualisiere den Chat in der Datenbank
    // ...
  
    const chatRef = doc(this.firestore, 'chats', chatId) as DocumentReference<Chat>;
    await updateDoc(chatRef, {
      participants: privateChat.participants
    });
  
    console.log(`Benutzer zu privatem Chat ${chatId} hinzugefügt.`);
  }

  async startChat(selectedItem: any) {
    const userId = "0qlW3ZW5a5pR0tFCdSoE"; // Der Benutzer, der den Chat erstellt
  
    // Beispiel: Erstelle ein Chat-Objekt
    const chat: Chat = {
      id: '', // Du kannst hier eine zufällige ID generieren oder die von Firestore generierte ID verwenden
      participants: [selectedItem], // Füge den ausgewählten Benutzer/Kanal hinzu
      messages: []
    };
  
    try {
      // Beispiel: Speichere das Chat-Objekt in der Datenbank
      const docRef = await addDoc(collection(this.firestore, 'chats'), chat);
      console.log(`Chat mit ${selectedItem.name || selectedItem.chanName} erstellt und in der Datenbank gespeichert. Chat-ID: ${docRef.id}`);
    } catch (error) {
      console.error('Fehler beim Speichern des Chats:', error);
    }
  }
}