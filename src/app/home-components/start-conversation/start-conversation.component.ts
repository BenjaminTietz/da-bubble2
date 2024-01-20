import { Component, OnInit } from '@angular/core';
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
} from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { Router } from '@angular/router';
import { onChildMoved } from 'firebase/database';
import { Chat } from '../../../models/chat.class';
import { User } from '../../../models/user.class';
import { updateDoc } from 'firebase/firestore';
import { ActivatedRoute } from '@angular/router';
import { ChatService } from '../../services/chat.service';
import { Channel } from '../../../models/channel.class';
import { FormsModule } from '@angular/forms';
import { Message } from '../../../models/message.class';
import { MessageAnswer } from '../../../models/messageAnswer.class';

@Component({
  selector: 'app-start-conversation',
  templateUrl: './start-conversation.component.html',
  styleUrls: ['./start-conversation.component.scss'],
})
export class StartConversationComponent implements OnInit {
  searchText: string = '';
  channelResults: any[] = [];
  userResults: any[] = [];
  auth: Auth;
  firestore: Firestore;
  currentUser: any;
  selectedItemId: any | string;
  selectedUsers: any[] = [];
  selectedItem: any;
  additionalUsersInChat: User[] = [];
  selectedChannel!: Channel;
  messageText: string = '';
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private chatService: ChatService
  ) {
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
    this.route.params.subscribe((params) => {
      const chatId = params['id'];
      console.log('Received Chat ID:', chatId);
      // Führe die erforderlichen Aktionen mit der Chat-ID durch
    });

    this.loadUserResults();
    this.loadChannelResults();
    //this.getCurrentUser();
  }

  // // Rufe getCurrentUser asynchron auf
  // async getCurrentUser() {
  //   const currentUser = await this.chatService.getCurrentUser();

  //   if (currentUser) {
  //     // Hier kannst du mit dem aktuellen Benutzer arbeiten
  //     console.log('Current User:', currentUser);
  //   } else {
  //     console.error('Fehler beim Abrufen des aktuellen Benutzers.');
  //   }
  // }
  // Initialize the search results and load the user and channel results local arrays

  selectChannel(channel: any) {
    this.selectedChannel = channel;
    console.log('Ausgewählter Channel:', this.selectedChannel.id);
  }

  redirectToChannel() {
    if (this.selectedChannel) {
      // Logic to start a chat with the selected channel
      // You can navigate to the channel or perform any other action
      const channelUrl = `/home/channels/${this.selectedChannel.id}`;
      this.router.navigate([channelUrl]);
    } else {
      // Logic to start a chat with the selected user (if any)
    }
  }

  async loadUserResults() {
    const usersQuery = query(collection(this.firestore, 'users'));
    const usersSnapshot = await getDocs(usersQuery);
    this.userResults = usersSnapshot.docs.map((doc) => doc.data()) as any[];
    console.log(this.userResults);
  }

  async loadChannelResults() {
    const channelsQuery = query(collection(this.firestore, 'channels'));
    const channelsSnapshot = await getDocs(channelsQuery);
    this.channelResults = channelsSnapshot.docs.map((doc) =>
      doc.data()
    ) as any[];
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
    this.channelResults = this.channelResults.filter((channel) =>
      channel.description.includes(channelName)
    );
  }

  filterUserResults(username: string) {
    this.userResults = this.userResults.filter(
      (user) => user.name && user.name.includes(username)
    );
  }

  addToRecipientList(user: User) {
    const existingUser = this.selectedUsers.find(
      (selectedUser) => selectedUser.id === user.id
    );

    if (!existingUser) {
      this.selectedUsers.push(user);
      console.log('Benutzer hinzugefügt:', user);
      console.log('Ausgewählte Benutzer:', this.selectedUsers);
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

    try {
      const currentUser = await this.getCurrentUser(userId);
      const additionalUsers = await this.getAdditionalUsers();

      if (!currentUser || additionalUsers.length === 0) {
        console.error('Ungültige Teilnehmerdaten.');
        return;
      }

      const privateChat: Chat = this.buildPrivateChat(
        currentUser,
        additionalUsers
      );
      const docRef = await this.savePrivateChat(privateChat);

      console.log(
        `Chat mit ${privateChat.participants
          .map((participant) => participant.name)
          .join(', ')} erstellt und in der Datenbank gespeichert. Chat-ID: ${
          docRef.id
        }`
      );
      this.router.navigate(['/home/private-messages', docRef.id]);
    } catch (error) {
      console.error('Fehler beim Erstellen des privaten Chats:', error);
    }
  }

  private async getCurrentUser(userId: string): Promise<User | null> {
    const currentUserQuery = query(
      collection(this.firestore, 'users'),
      where('authUID', '==', userId)
    );
    const currentUserSnapshot = await getDocs(currentUserQuery);
    const currentUserData = currentUserSnapshot.docs[0]?.data();
    return currentUserData
      ? new User({
          id: currentUserData['id'],
          authUID: currentUserData['authUID'],
          name: currentUserData['name'],
          status: currentUserData['status'],
          avatarURL: currentUserData['avatarURL'],
          photoURL: currentUserData['photoURL'],
          channels: currentUserData['channels'],
          email: currentUserData['email'],
        })
      : null;
  }

  private async getAdditionalUsers(): Promise<User[]> {
    const additionalUsersPromises = this.selectedUsers.map(
      async (selectedUser) => {
        const additionalUserQuery = query(
          collection(this.firestore, 'users'),
          where('id', '==', selectedUser.id)
        );
        const additionalUserSnapshot = await getDocs(additionalUserQuery);
        const additionalUserData = additionalUserSnapshot.docs[0]?.data();

        return additionalUserData
          ? new User({
              id: additionalUserData['id'],
              authUID: additionalUserData['authUID'],
              name: additionalUserData['name'],
              status: additionalUserData['status'],
              avatarURL: additionalUserData['avatarURL'],
              photoURL: additionalUserData['photoURL'],
              channels: additionalUserData['channels'],
              email: additionalUserData['email'],
            })
          : null;
      }
    );

    const additionalUsersInChat = await Promise.all(additionalUsersPromises);
    return additionalUsersInChat.filter((user) => user !== null) as User[];
  }

  private buildPrivateChat(currentUser: User, additionalUsers: User[]): Chat {
    // Konvertiere die Benutzerobjekte in ein datenbankfreundliches Format
    
    const additionalUsersForDB: User[] = additionalUsers.map((user) =>
      this.userToDatabaseFormat(user)
    );

    return {
      participants: additionalUsersForDB,
      id: '',
      messages: [],
      date: '',
      time: '',
      chatStartedBy: currentUser, // Add the chatStartedBy property
    };
  }

  private userToDatabaseFormat(user: User): any {
    return {
      id: user.id,
      name: user.name,
      status: user.status,
      authUID: user.authUID,
      avatarURL: user.avatarURL,
      photoURL: user.photoURL,
      // ... andere Eigenschaften, die du speichern möchtest
    };
  }

  private async savePrivateChat(
    privateChat: Chat
  ): Promise<DocumentReference<DocumentData>> {
    const { chatStartedBy, ...chatDataWithoutStartedBy } = privateChat;

    const docRef = await addDoc(
      collection(this.firestore, 'chats'),
      chatDataWithoutStartedBy
    );

    privateChat.id = docRef.id;
    await updateDoc(doc(this.firestore, 'chats', docRef.id), { id: docRef.id });
    return docRef;
  }

  async startChat() {
    if (this.selectedChannel) {
      // Logic to post a post with the selected channel must be implemented before navigating to the channel
      this.router.navigate(['/home/channels', this.selectedChannel.id]);
      return;
    }
    const userAuthUID = sessionStorage.getItem('userAuthUID');
  
    if (!userAuthUID) {
      console.error('AuthUID im Session Storage nicht gefunden.');
      return;
    }
  
    if (this.selectedUsers.length === 0) {
      console.error('Mindestens ein Empfänger muss ausgewählt sein.');
      return;
    }
  
    if (!this.messageText.trim()) {
      console.error('Nachrichtentext darf nicht leer sein.');
      return;
    }
  
    // 1. Finde den aktuellen Benutzer in der users-Sammlung
    const userQuery = query(
      collection(this.firestore, 'users'),
      where('authUID', '==', userAuthUID)
    );
    const userSnapshot = await getDocs(userQuery);
  
    if (userSnapshot.empty) {
      console.error('Aktueller Benutzer nicht in der users-Sammlung gefunden.');
      return;
    }
  
    const currentUserData = userSnapshot.docs[0].data();
  
    // 2. Erstelle ein Chat-Objekt mit den Informationen des aktuellen Benutzers
    const chat: Chat = {
      id: '', // Wird unten aktualisiert
      participants: this.selectedUsers.map(user => this.userToDatabaseFormat(user)),
      messages: [],
      chatStartedBy: { // Direkt die Benutzerdaten in chatStartedBy einfügen
        id: currentUserData['id'],
        name: currentUserData['name'],
        photoURL: currentUserData['photoURL'],
        authUID: currentUserData['authUID'],
        status: false,
        avatarURL: '',
        channels: [],
        email: '',
      },
      date: '',
      time: '',
    };
  
    try {
      // 3. Speichere das Chat-Objekt in der Datenbank
      const docRef = await addDoc(collection(this.firestore, 'chats'), chat);
      console.log(
        `Chat mit ${this.selectedUsers
          .map((user) => user.name)
          .join(', ')} erstellt und in der Datenbank gespeichert. Chat-ID: ${
          docRef.id
        }`
      );
  
      // Aktualisiere die ID im erstellten Chat-Objekt
      chat.id = docRef.id;
  
      // 4. Aktualisiere den Chat in der Datenbank mit der neuen ID und der neuen Nachricht
      const newMessage: Message = {
        id: docRef.id, // Die ID der Nachricht wird auf die ID des Chats gesetzt
        text: this.messageText,
        chatId: docRef.id,
        user: {
          id: currentUserData['id'],
          name: currentUserData['name'],
          photoURL: currentUserData['photoURL'],
          authUID: currentUserData['authUID'],
          status: false,
          avatarURL: '',
          channels: [],
          email: '',
        },
        messageAnwser: [],
        reactions: [],
        date: '',
        time: '',
      };
  
      await updateDoc(doc(this.firestore, 'chats', docRef.id), {
        id: docRef.id,
        messages: [newMessage, ...chat.messages], // Füge die neue Nachricht zum Array hinzu
      });
  
      this.router.navigate(['/home/private-messages', docRef.id]);
    } catch (error) {
      console.error('Fehler beim Speichern des Chats:', error);
    }
  }
}
