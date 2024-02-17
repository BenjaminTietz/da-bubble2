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
import { SearchService } from '../../services/search.service';
@Component({
  selector: 'app-start-conversation',
  templateUrl: './start-conversation.component.html',
  styleUrls: ['./start-conversation.component.scss'],
})
export class StartConversationComponent implements OnInit {

  auth: Auth;
  firestore: Firestore;
  currentUser: any;
  selectedItemId: any | string;

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
    private userService: UserService,
    public searchService: SearchService
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
    this.searchService.searchActive = false;
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
    this.searchService.userResults = [];
  }

  clearChannelResults() {
    this.searchService.channelResults = [];
  }

  addToRecipientList(user: User) {
    const currentUser = this.userService.user; 
    if (user.id === currentUser.id) {
      console.error('Sie können sich nicht selbst als Empfänger hinzufügen.');
      return;
    }

    this.searchService.selectedUsers = [];
  
    this.searchService.selectedUsers.push(user);
    console.log('Benutzer hinzugefügt:', user);
    console.log('Ausgewählte Benutzer:', this.searchService.selectedUsers);
  }

  // Create a private chat with the selected users

  async createPrivateChat() {
    const userId = sessionStorage.getItem('userAuthUID');
  
    if (!userId) {
      console.error('AuthUID im Session Storage nicht gefunden.');
      return;
    }
  
    try {
      // Holen des aktuellen Benutzers
      const currentUser = await this.getCurrentUser(userId);
  
      if (!currentUser) {
        console.error('Ungültige Benutzerdaten.');
        return;
      }
  
      // Filtern der ausgewählten Benutzer, um den aktuellen Benutzer auszuschließen
      const selectedUsersWithoutCurrentUser = this.searchService.selectedUsers.filter(user => user.id !== currentUser.id);
  
      if (selectedUsersWithoutCurrentUser.length === 0) {
        console.error('Es wurden keine gültigen zusätzlichen Benutzer ausgewählt.');
        return;
      }
  
      // Holen der zusätzlichen Benutzer
      const additionalUsers = await this.getAdditionalUsers(selectedUsersWithoutCurrentUser);
  
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

  private async getAdditionalUsers(selectedUsersWithoutCurrentUser: User[]): Promise<User[]> {
    const additionalUsersPromises = selectedUsersWithoutCurrentUser.map(
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
  
    const additionalUsers = await Promise.all(additionalUsersPromises);
    return additionalUsers.filter((user) => user !== null) as User[];
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

      if (this.searchService.selectedUsers.length === 0) {
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
      participants: this.searchService.selectedUsers.map((user) =>
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

  deleteAssignedUser() {
    console.log('deleteAssignedUser');
    this.searchService.selectedUsers = [];
  }

  deleteAssignedChannel() {
    this.selectedChannels = [];
    console.log('deleteAssignedChannel');
  }

  // emoji
  selectEmoji($event: { emoji: { native: string } }) {
    this.messageText += $event.emoji.native;
  }

  toggleSetEmojiPicker() {
    this.emojiPickerAnswerVisible = !this.emojiPickerAnswerVisible;
  }
}
