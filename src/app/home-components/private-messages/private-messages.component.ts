import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import {
  getFirestore,
  //Firestore,
  collection,
  query,
  where,
  getDocs,
  CollectionReference,
  DocumentData,
  addDoc,
  doc,
  DocumentReference,
  orderBy, 
  //onSnapshot
} from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { Router } from '@angular/router';
import { onChildMoved } from 'firebase/database';
import { Chat } from '../../../models/chat.class';
import { User } from '../../../models/user.class';
import { updateDoc } from 'firebase/firestore';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Message } from '../../../models/message.class';
import { MessageAnswer } from '../../../models/messageAnswer.class';
import { ChatService } from '../../services/chat.service';
import { Subscription } from 'rxjs';
import { Firestore, onSnapshot } from '@angular/fire/firestore';



@Component({
  selector: 'app-private-messages',
  templateUrl: './private-messages.component.html',
  styleUrl: './private-messages.component.scss',
})
export class PrivateMessagesComponent implements OnInit,
  OnDestroy {
  chatId: any;
  selectedUsers: User[] = [];
  chatData: any;
  messageText: string = '';
  messages: Message[] = []; // Hinzugefügt: Array zum Speichern von Nachrichten
  private chatDataSubscription: Subscription | undefined;
  reciver: User[] = [];
  sender: User[] = [];

  //Timo
  unsubMessages!: () => void;
  listMessages: any = [];
  newMessage: Message = new Message();
  storedUserAuthUID: any;
  user: User = new User();
  firestore: Firestore = inject(Firestore);



  constructor(
    private route: ActivatedRoute,
    public dialog: MatDialog,
    private chatService: ChatService,
    private router: Router  // Inject the Router service
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.chatId = params['id'];
      this.loadChatData();
      this.unsubMessages = this.subMessagesList(this.chatId); // Timo
    });
    console.log('Chat-ID:', this.chatId);
    console.log('Chat-Daten:', this.chatData);
    console.log('Is routing active?', this.router.url);

    this.storedUserAuthUID = sessionStorage.getItem('userAuthUID');
    this.getUser();
    console.log(this.user)

  }


  getUser() {
    let q;
    if (this.storedUserAuthUID) {
      q = query(this.getUsersRef(), where("authUID", "==", this.storedUserAuthUID));
    } else {
      q = query(this.getUsersRef(), where("authUID", "==", this.storedUserAuthUID)); // q = input für Gastzugang
    }

    return onSnapshot(q, (docSnap: any) => {
      docSnap.forEach((doc: any) => {
        this.user = new User(this.setUserObject(doc.data()))
      })
    })

  }

  getUsersRef() {
    return collection(this.firestore, 'users');
  }

  setUserObject(obj: any) {
    return {
      id: obj.id || "",
      authUID: obj.authUID || "",
      name: obj.name || "",
      status: obj.status || true,
      avatarURL: obj.avatarURL || '', //code added by Ben
      photoURL: obj.photoURL || '',
      channels: obj.channels || [],
      email: obj.email || ''
    }
  }



  //Timo
  subMessagesList(chat_id: any) {
    const q = query(this.getMessageSubcollectionRef(chat_id), where('chatId', '==', chat_id), orderBy('date'), orderBy('time'));
    return onSnapshot(q, (list) => {
      this.listMessages = [];
      list.forEach(element => {
        this.listMessages.push(this.setMessageObject(element.data(), element.id));
      });
    });
  }


  getMessageSubcollectionRef(chat_id: any) {
    return collection(this.chatService.firestore, 'chats', chat_id, 'messages')
  }


  setMessageObject(obj: any, id: string,): Message {
    return {
      id: id || "",
      text: obj.text || "",
      chatId: obj.chatId || "",
      user: obj.user || this.user,
      date: obj.date || "",
      time: obj.time || "",
      messageAnwser: obj.messageAnswer || "",
      reactions: obj.reactions || "",
    }
  }


  async addMessage(chat_id: any) {
    await this.getUser();
  
    // Create a new message object
    const newMessage: Message = {
      id: '',
      text: this.messageText,
      chatId: this.chatId,
      user: this.getUserObjectForFirestore(), // Convert User to a plain JavaScript object
      date: this.getCurrentDate(),
      time: this.getCurrentTime(),
      messageAnwser: [],
      reactions: [],
    };
  
    // Add the new message to the Firestore subcollection
    try {
      const docRef = await addDoc(
        this.getMessageSubcollectionRef(chat_id),
        this.setMessageObject(newMessage, '')
      );
  
      // Retrieve the new document ID
      const newID = docRef.id;
  
      // Update the message with its ID
      await this.updateMessageWithId(newID, chat_id);
  
      // Clear the messageText input
      this.messageText = '';
    } catch (error) {
      console.error('Error adding message:', error);
    }
  }
  
  getUserObjectForFirestore() {
    // Convert the User object to a plain JavaScript object
    return {
      id: this.user.id,
      authUID: this.user.authUID,
      name: this.user.name,
      status: this.user.status,
      avatarURL: this.user.avatarURL,
      photoURL: this.user.photoURL,
      channels: this.user.channels,
      email: this.user.email,
    };
  }




  async updateMessageWithId(newId: any, chat_id: any) {
    const docRef = doc(this.getMessageSubcollectionRef(chat_id), newId);
    await updateDoc(docRef, { id: newId }).catch(
      (err) => { console.log(err); }
    ).then(
      () => { }
    );
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







  ngOnDestroy(): void {
    // Unsubscribe from the chatDataSubscription to avoid memory leaks
    if (this.chatDataSubscription) {
      this.chatDataSubscription.unsubscribe();
    }
  }

  async loadChatData() {
    try {
      this.chatData = await this.chatService.getChatDataById(this.chatId);

      if (this.chatData) {
        this.selectedUsers = this.chatData.participants;
        this.messages = this.chatData.messages; // Hinzugefügt: Lade Nachrichten aus Chat-Daten
      } else {
        console.error('Chat-Daten nicht gefunden.');
      }
    } catch (error) {
      console.error('Fehler beim Laden der Chat-Daten:', error);
    }
  }

  getParticipantInfo(participant: User): string {
    return `${participant.name} (${participant.email})`;
  }

  async onSendMessage() {
    // Hier kannst du die Logik zum Senden der Nachricht implementieren
    if (this.messageText.trim() !== '') {
      const currentUser: User = {
        id: '',
        authUID: '',
        name: '',
        status: false,
        avatarURL: '',
        photoURL: '',
        channels: [],
        email: ''
      };

      // Erstelle eine neue Nachricht in der Unterkollektion "messages" des Chats
      const messagesCollection = collection(getFirestore(), 'chats', this.chatId, 'messages');
      const newMessageRef = await addDoc(messagesCollection, {
        text: this.messageText,
        user: currentUser,
        // Weitere Felder der Nachricht hier hinzufügen
      });

      console.log('Nachricht gesendet:', this.messageText);
      const newMessage: Message = {
        id: newMessageRef.id,
        text: this.messageText,
        chatId: this.chatId,
        user: currentUser,
        messageAnwser: [], // Falls benötigt
        reactions: [],
        date: '',
        time: ''
      };

      this.saveMessageToDatabase(newMessage);

      this.messageText = '';
    }
  }

  saveMessageToDatabase(message: Message) {
    const firestore = getFirestore();
    const chatRef = doc(firestore, 'chats', this.chatId);

    updateDoc(chatRef, {
      messages: [...this.messages, message], // Hinzugefügt: Füge die neue Nachricht zum Array hinzu
    });
  }
}
