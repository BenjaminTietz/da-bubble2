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
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { UserService } from '../../services/user.service';
@Component({
  selector: 'app-start-conversation',
  templateUrl: './start-conversation.component.html',
  styleUrls: ['./start-conversation.component.scss'],
})
export class StartConversationComponent implements OnInit {
  searchText: string = '';
  searchActive: boolean = false;
  channelResults: any[] = [];
  userResults: any[] = [];
  auth: Auth;
  firestore: Firestore;
  currentUser: any;
  selectedItemId: any | string;
  selectedUsers: any[] = [];
  selectedChannels: Channel[] = [];
  selectedItem: any;
  additionalUsersInChat: User[] = [];
  selectedChannel!: Channel;
  messageText: string = '';
  storedUserAuthUID: any;
  user: User = new User();

  // emoji
  emojiPickerAnswerVisible: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private chatService: ChatService,
    private userService: UserService
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
    this.userService.getUser();
    this.searchActive = false;
  }

selectChannel(channel: Channel) {
  // Überprüfen, ob der Kanal bereits ausgewählt ist
  const index = this.selectedChannels.findIndex(
    (selectedChannel) => selectedChannel.id === channel.id
  );

  if (index === -1) {
    // Kanal wurde noch nicht ausgewählt, füge ihn hinzu
    this.selectedChannels.push(channel);
    console.log('Kanal hinzugefügt:', channel);
  } else {
    // Kanal wurde bereits ausgewählt, entferne ihn
    this.selectedChannels.splice(index, 1);
    console.log('Kanal entfernt:', channel);
  }
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

  clearUserResults() {
    this.userResults = [];
  }

  clearChannelResults() {
    this.channelResults = [];
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
  
    if (username.length >= 3) {

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
  
    if (channelName.length >= 3) {

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
  

  clearSearchResults() {
    this.channelResults = [];
    this.userResults = [];
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

  addToRecipientList(user: User) {
    // Leere die ausgewählten Benutzer, bevor ein neuer hinzugefügt wird
    this.selectedUsers = [];
  
    // Füge den neuen Benutzer hinzu
    this.selectedUsers.push(user);
    console.log('Benutzer hinzugefügt:', user);
    console.log('Ausgewählte Benutzer:', this.selectedUsers);
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
    if (!this.messageText.trim()) {
      console.error('Nachrichtentext darf nicht leer sein.');
      return;
    }
    if (this.selectedChannel) {
      this.router.navigate(['/home/channels', this.selectedChannel.id]);
      return;
    }

    try {
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

      const currentUserData = await this.getCurrentUser(userAuthUID);
      if (!currentUserData) {
        console.error(
          'Aktueller Benutzer nicht in der users-Sammlung gefunden.'
        );
        return;
      }

      const chat = await this.createChat(currentUserData);
      if (!chat) {
        console.error('Fehler beim Erstellen des Chats.');
        return;
      }

      const message = await this.createMessage(chat.id);
      if (!message) {
        console.error('Fehler beim Erstellen der Nachricht.');
        return;
      }

      this.router.navigate(['/home/private-messages', chat.id]);
    } catch (error) {
      console.error('Fehler beim Speichern des Chats:', error);
    }
  }

  async createChat(currentUserData: any) {
    const chat: Chat = {
      id: '',
      participants: this.selectedUsers.map((user) =>
        this.userToDatabaseFormat(user)
      ),
      messages: [],
      chatStartedBy: this.getUserDetails(currentUserData),
      date: this.userService.getCurrentDate(),
      time: this.userService.getCurrentTime(),
    };
    const docRef = await addDoc(collection(this.firestore, 'chats'), chat);
    chat.id = docRef.id;
    return chat;
  }

  async createMessage(chatId: string) {
    const newMessage: Message = {
      id: '',
      text: this.messageText,
      chatId: chatId,
      user: this.getUserDetails(this.user),
      messageAnswer: [],
      reactions: [],
      date: this.userService.getCurrentDate(),
      time: this.userService.getCurrentTime(),
      messageSendBy: this.getUserDetails(this.user),
    };
    const messagesCollectionRef = collection(
      this.firestore,
      'chats',
      chatId,
      'messages'
    );
    const messageDocRef = await addDoc(messagesCollectionRef, newMessage);
    newMessage.id = messageDocRef.id;
    return newMessage;
  }

  getUserDetails(user: User) {
    return {
      id: user.id,
      name: user.name,
      photoURL: user.photoURL,
      authUID: user.authUID,
      status: false,
      avatarURL: user.avatarURL,
      channels: [],
      email: user.email,
    };
  }

  userToDatabaseFormat(user: User) {
    return {
      id: user.id,
      name: user.name,
      photoURL: user.photoURL,
      authUID: user.authUID,
      status: false,
      avatarURL: user.avatarURL,
      channels: [],
      email: user.email,
    };
  }

  // emoji
  selectEmoji($event: { emoji: { native: string } }) {
    this.messageText += $event.emoji.native;
  }

  toggleSetEmojiPicker() {
    this.emojiPickerAnswerVisible = !this.emojiPickerAnswerVisible;
  }
}
