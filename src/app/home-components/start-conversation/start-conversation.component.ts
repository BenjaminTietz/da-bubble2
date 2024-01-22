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
  onSnapshot,
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
  storedUserAuthUID: any;
  user: User = new User();

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
    });
    this.storedUserAuthUID = sessionStorage.getItem('userAuthUID');
    this.getUser();
    this.loadUserResults();
    this.loadChannelResults();
  }

  getUser() {
    let q;
    if (this.storedUserAuthUID) {
      q = query(
        this.getUsersRef(),
        where('authUID', '==', this.storedUserAuthUID)
      );
    } else {
      q = query(
        this.getUsersRef(),
        where('authUID', '==', this.storedUserAuthUID)
      ); // q = input für Gastzugang
    }

    return onSnapshot(q, (docSnap: any) => {
      docSnap.forEach((doc: any) => {
        this.user = new User(this.setUserObject(doc.data()));
      });
    });
  }

  getUsersRef() {
    return collection(this.firestore, 'users');
  }

  setUserObject(obj: any) {
    return {
      id: obj.id || '',
      authUID: obj.authUID || '',
      name: obj.name || '',
      status: obj.status || true,
      avatarURL: obj.avatarURL || '', //code added by Ben
      photoURL: obj.photoURL || '',
      channels: obj.channels || [],
      email: obj.email || '',
    };
  }

  getCurrentTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  getCurrentDate() {
    const now = new Date();
    const day = now.getDate().toString().padStart(2, '0');
    const month = (now.getMonth() + 1).toString().padStart(2, '0'); // Monate sind 0-indiziert
    const year = now.getFullYear();
    return `${day}.${month}.${year}`;
  }

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
      chatStartedBy: currentUser,
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
    } else {
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
  
      try {
        // 1. Find the current user in the 'users' collection
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
  
        // 2. Create a Chat object with the information of the current user
        const chat: Chat = {
          id: '', // Will be updated below
          participants: this.selectedUsers.map((user) =>
            this.userToDatabaseFormat(user)
          ),
          messages: [], // No need to include messages here, it will be stored in the subcollection
          chatStartedBy: {
            id: this.user.id,
            name: this.user.name,
            photoURL: this.user.photoURL,
            authUID: this.user.authUID,
            status: false,
            avatarURL: this.user.avatarURL,
            channels: [],
            email: this.user.email,
          },
          date: this.getCurrentDate(),
          time: this.getCurrentTime(),
        };
  
        // 3. Save the Chat object in the 'chats' collection
        const docRef = await addDoc(collection(this.firestore, 'chats'), chat);
        console.log(`Chat mit ${this.selectedUsers.map((user) => user.name).join(', ')} erstellt und in der Datenbank gespeichert. Chat-ID: ${docRef.id}`);
  
        // Update the ID in the created Chat object
        chat.id = docRef.id;
  
        // 4. Create a subcollection reference for 'messages'
        const messagesCollectionRef = collection(this.firestore, 'chats', docRef.id, 'messages');
  
        // 5. Add the new message to the 'messages' subcollection
        const newMessage: Message = {
          id: '', // Will be updated below
          text: this.messageText,
          chatId: docRef.id,
          user: {
            id: this.user.id,
            name: this.user.name,
            photoURL: this.user.photoURL,
            authUID: this.user.authUID,
            status: false,
            avatarURL: this.user.avatarURL,
            channels: [],
            email: this.user.email,
          },
          messageAnwser: [],
          reactions: [],
          date: this.getCurrentDate(),
          time: this.getCurrentTime(),
          messageSendBy: {
            id: this.user.id,
            name: this.user.name,
            photoURL: this.user.photoURL,
            authUID: this.user.authUID,
            status: false,
            avatarURL: this.user.avatarURL,
            channels: [],
            email: this.user.email,
          },
        };
  
        // 6. Add the new message to the 'messages' subcollection
        const messageDocRef = await addDoc(messagesCollectionRef, newMessage);
        console.log(`Neue Nachricht in der Subcollection 'messages' gespeichert. Nachricht-ID: ${messageDocRef.id}`);
  
        // Update the ID in the created Message object
        newMessage.id = messageDocRef.id;
  
        this.router.navigate(['/home/private-messages', docRef.id]);
      } catch (error) {
        console.error('Fehler beim Speichern des Chats:', error);
      }
    }
  }
  
}
