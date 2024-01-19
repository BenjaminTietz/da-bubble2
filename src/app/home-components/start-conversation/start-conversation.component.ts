import { Component, OnInit } from '@angular/core';
import { getFirestore, Firestore, collection, query, where, getDocs, CollectionReference, DocumentData, addDoc, doc, DocumentReference } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { Router } from '@angular/router';
import { onChildMoved } from 'firebase/database';
import { Chat } from '../../../models/chat.class';
import { User } from '../../../models/user.class';
import { updateDoc } from 'firebase/firestore';
import { ActivatedRoute } from '@angular/router';
import { ChatService } from '../../services/chat.service';

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
  currentUser: any;
selectedItemId: any|string;
selectedUsers: any[] = [];
selectedItem: any;

  constructor(private router: Router, private route: ActivatedRoute, private chatService: ChatService) {
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

    this.route.params.subscribe(params => {
      const chatId = params['id'];
      console.log('Received Chat ID:', chatId);
      // Führe die erforderlichen Aktionen mit der Chat-ID durch
    });

    this.loadUserResults();
    this.loadChannelResults();
    this.getCurrentUser();
  }

    // Rufe getCurrentUser asynchron auf
    async getCurrentUser() {
      const currentUser = await this.chatService.getCurrentUser();
  
      if (currentUser) {
        // Hier kannst du mit dem aktuellen Benutzer arbeiten
        console.log('Current User:', currentUser);
      } else {
        console.error('Fehler beim Abrufen des aktuellen Benutzers.');
      }
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



  addToRecipientList(user: any) {
    // Prüfe, ob der Benutzer bereits ausgewählt ist
    const existingUser = this.selectedUsers.find(selectedUser => selectedUser.id === user.id);
  
    if (!existingUser) {
      this.selectedUsers.push(user);
      console.log('Benutzer hinzugefügt:', user);
    } else {
      console.log('Benutzer bereits ausgewählt:', user);
    }
  }

  // Create a private chat with the selected users

  async createPrivateChat() {
    const userId = sessionStorage.getItem('userAuthUID');
  
    if (!userId) {
      console.error('AuthUID im Session Storage nicht gefunden.');
      return;
    }
  
    const privateChat: Chat = {
      participants: [],
      id: '', // Falls du eine zufällige ID generieren möchtest, kannst du dies hier tun
      messages: []
    };
  
    // Füge den aktuellen Benutzer zum Chat hinzu
    const currentUserQuery = query(collection(this.firestore, 'users'), where('authUID', '==', userId));
    const currentUserSnapshot = await getDocs(currentUserQuery);
    const currentUser = currentUserSnapshot.docs[0].data();
  
    const currentUserInChat: User = {
      id: currentUser['id'],
      authUID: currentUser['authUID'],
      name: currentUser['name'],
      status: currentUser['status'],
      avatarURL: currentUser['avatarURL'],
      photoURL: currentUser['photoURL'],
      channels: currentUser['channels'],
      email: currentUser['email']
    };
  
    privateChat.participants.push(currentUserInChat);
  
    // Füge weitere Benutzer zum Chat hinzu
    const additionalUserIds = ["UserId2", "UserId3"]; // Beispiel-IDs, ersetze sie durch die tatsächlichen Benutzer-IDs
    for (const additionalUserId of additionalUserIds) {
      const additionalUserQuery = query(collection(this.firestore, 'users'), where('id', '==', additionalUserId));
      const additionalUserSnapshot = await getDocs(additionalUserQuery);
      const additionalUser = additionalUserSnapshot.docs[0].data();
  
      if (additionalUser) {
        const additionalUserInChat: User = {
          id: additionalUser['id'],
          authUID: additionalUser['authUID'],
          name: additionalUser['name'],
          status: additionalUser['status'],
          avatarURL: additionalUser['avatarURL'],
          photoURL: additionalUser['photoURL'],
          channels: additionalUser['channels'],
          email: additionalUser['email']
        };
  
        privateChat.participants.push(additionalUserInChat);
      }
    }
  
    // Überprüfe, ob participants definiert ist und mindestens einen Teilnehmer enthält
    if (!privateChat.participants || privateChat.participants.length === 0) {
      console.error('Ungültige Teilnehmerdaten.');
      return;
    }
  
    try {
      // Füge den Chat in die Datenbank ein
      const docRef = await addDoc(collection(this.firestore, 'chats'), privateChat);
  
      // Aktualisiere die ID im erstellten Chat-Objekt
      privateChat.id = docRef.id;
  
      // Aktualisiere den Chat in der Datenbank mit der neuen ID
      await updateDoc(doc(this.firestore, 'chats', docRef.id), { id: docRef.id });
  
      console.log(`Chat mit ${privateChat.participants.map(participant => participant.name).join(', ')} erstellt und in der Datenbank gespeichert. Chat-ID: ${docRef.id}`);
  
      // Navigiere zur Chat-Seite
      this.router.navigate(['/home/private-messages', docRef.id]);
    } catch (error) {
      console.error('Fehler beim Speichern des Chats:', error);
    }
  }

  async startChat() {
    const userAuthUID = sessionStorage.getItem('userAuthUID');
  
    if (!userAuthUID) {
      console.error('AuthUID im Session Storage nicht gefunden.');
      return;
    }
  
    // 1. Finde den aktuellen Benutzer in der users-Sammlung
    const userQuery = query(collection(this.firestore, 'users'), where('authUID', '==', userAuthUID));
    const userSnapshot = await getDocs(userQuery);
  
    if (userSnapshot.empty) {
      console.error('Aktueller Benutzer nicht in der users-Sammlung gefunden.');
      return;
    }
  
    const currentUser = userSnapshot.docs[0].data();
  
    // 2. Erstelle ein Chat-Objekt mit den Informationen des aktuellen Benutzers
    const chat: Chat = {
      id: '', // Wird unten aktualisiert
      participants: [{
        id: currentUser['id'],
        name: currentUser['name'],
        photoURL: currentUser['photoURL'],
        authUID: currentUser['authUID'],
        status: false,
        avatarURL: '',
        channels: [],
        email: ''
      }],
      messages: []
    };
  
    // 3. Füge den ausgewählten Benutzer (selectedItem) zum participants-Array hinzu
    if (this.selectedItem) {
      const selectedUser: User = {
        id: this.selectedItem['id'],
        authUID: this.selectedItem['authUID'],
        name: this.selectedItem['name'],
        status: this.selectedItem['status'],
        avatarURL: this.selectedItem['avatarURL'],
        photoURL: this.selectedItem['photoURL'],
        channels: this.selectedItem['channels'],
        email: this.selectedItem['email']
      };
      
      chat.participants.push(selectedUser);
    } else {
      console.error('Kein ausgewähltes Element.');
      return;
    }
  
    // 4. Speichere das Chat-Objekt in der Datenbank und aktualisiere die ID
    let docRef: DocumentReference<DocumentData> = {} as DocumentReference<DocumentData>;
    try {
      docRef = await addDoc(collection(this.firestore, 'chats'), chat);
      console.log(`Chat mit ${this.selectedItem.name || this.selectedItem.chanName} erstellt und in der Datenbank gespeichert. Chat-ID: ${docRef.id}`);

      // Aktualisiere die ID im erstellten Chat-Objekt
      chat.id = docRef.id;

      // Aktualisiere den Chat in der Datenbank mit der neuen ID
      await updateDoc(doc(this.firestore, 'chats', docRef.id), { id: docRef.id });
    } catch (error) {
      console.error('Fehler beim Speichern des Chats:', error);
    }

    if (docRef) {
      this.router.navigate(['/home/private-messages', docRef.id]);
    }
  }
}