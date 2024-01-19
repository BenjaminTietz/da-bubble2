import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Message } from '../../models/message.class';
import { MessageAnswer } from '../../models/messageAnswer.class';
import { User } from '../../models/user.class';
import { getFirestore, Firestore, collection, query, where, getDocs, CollectionReference, DocumentData, addDoc, doc, DocumentReference } from 'firebase/firestore';
import { Chat } from '../../models/chat.class';
import { initializeApp } from 'firebase/app';
import { getAuth, Auth, AuthError } from 'firebase/auth';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private messages: Message[] = [];
  private messageAnswers: MessageAnswer[] = [];

  chats: any[] = [];
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

  async getCurrentUser(): Promise<User | undefined> {
    console.log('getCurrentUser()');
    const userAuthUID = sessionStorage.getItem('userAuthUID');

    if (!userAuthUID) {
      console.error('AuthUID im Session Storage nicht gefunden.');
      return undefined;
    }

    const userQuery = query(collection(this.firestore, 'users'), where('authUID', '==', userAuthUID));
    const userSnapshot = await getDocs(userQuery);

    if (userSnapshot.empty) {
      console.error('Aktueller Benutzer nicht in der users-Sammlung gefunden.');
      return undefined;
    }

    const currentUserData = userSnapshot.docs[0].data();

    const currentUser: User = {
      id: currentUserData['id'],
      authUID: currentUserData['authUID'],
      name: currentUserData['name'],
      status: currentUserData['status'],
      avatarURL: currentUserData['avatarURL'],
      photoURL: currentUserData['photoURL'],
      channels: currentUserData['channels'],
      email: currentUserData['email'],
      // ... weitere Eigenschaften
    };

    return currentUser;

    console.log(currentUser);
  }

  // ... restliche Methoden

  async getChatDataById(chatId: string): Promise<Chat | null> {
    try {
      // Query erstellen, um den Chat mit der gegebenen ID zu finden
      const chatQuery = query(collection(this.firestore, 'chats'), where('id', '==', chatId));
      const chatSnapshot = await getDocs(chatQuery);

      // Überprüfen, ob der Chat gefunden wurde
      if (!chatSnapshot.empty) {
        const chatData: DocumentData = chatSnapshot.docs[0].data();
        return chatData as Chat;
      } else {
        console.error('Chat nicht gefunden.');
        return null;
      }
    } catch (error) {
      console.error('Fehler beim Laden der Chat-Daten:', error);
      return null;
    }
  }

  getChats(): Chat[] {
    return this.chats;
  }

  async getChatsByParticipant(authUID: string): Promise<Chat[]> {
  const chatsQuery = query(
    collection(this.firestore, 'chats'),
    where('participants', 'array-contains-any', [authUID])
  );
  const chatsSnapshot = await getDocs(chatsQuery);

  const chats: Chat[] = [];

  await Promise.all(
    chatsSnapshot.docs.map(async (doc) => {
      const chatData: DocumentData = doc.data();

      // Überprüfen, ob 'participants' im Chat-Dokument ein Array ist
      if (Array.isArray(chatData['participants'])) {
        const participants: User[] = [];

        // Durchsuche die participants und filtere nach dem aktuellen Nutzer
        for (const participant of chatData['participants']) {
          participants.push(participant);
        }

        // Ensure that the current user is included in the participants
        if (!participants.some((participant) => participant.authUID === authUID)) {
          // Add the current user to the participants list
          const currentUser = await this.getCurrentUser();
          if (currentUser) {
            participants.push(currentUser);
          }
        }

        // Füge das Chat-Dokument mit den gefilterten participants zur Liste hinzu
        const filteredChat: Chat = {
          id: doc.id,
          participants: participants,
          messages: chatData['messages'] || [], // Ensure messages is defined and provide a default value
        };

        chats.push(filteredChat);
      }
    })
  );

  return chats;
}

  
  async loadChats() {
    const userAuthUID = sessionStorage.getItem('userAuthUID');
  
    if (userAuthUID) {
      try {
        console.log('Fetching chats for user with ID:', userAuthUID);
        this.chats = await this.getChatsByParticipant(userAuthUID);
        console.log('Loaded Chats:', this.chats);
      } catch (error) {
        console.error('Error loading chats:', error);
      }
    } else {
      console.error('AuthUID not found in Session Storage.');
    }
  }
}
