import { Component, OnDestroy, OnInit } from '@angular/core';
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
import { MatDialog } from '@angular/material/dialog';
import { Message } from '../../../models/message.class';
import { MessageAnswer } from '../../../models/messageAnswer.class';
import { ChatService } from '../../services/chat.service';
import { Subscription } from 'rxjs';

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

  
  constructor(
    private route: ActivatedRoute,
    public dialog: MatDialog,
    private chatService: ChatService,
    private router: Router  // Inject the Router service
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.chatId = params['id'];
      this.loadChatData();
      //this.unsubPosts = this.subPostsList(this.channelID);
    });
    console.log('Chat-ID:', this.chatId);
    console.log('Chat-Daten:', this.chatData);
    console.log('Is routing active?', this.router.url);
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
