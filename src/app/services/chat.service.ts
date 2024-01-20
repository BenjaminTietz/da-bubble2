import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Message } from '../../models/message.class';
import { MessageAnswer } from '../../models/messageAnswer.class';
import { User } from '../../models/user.class';
import { getFirestore, Firestore, collection, query, where, getDocs, CollectionReference, DocumentData, addDoc, doc, DocumentReference, onSnapshot, orderBy } from 'firebase/firestore';
import { Chat } from '../../models/chat.class';
import { initializeApp } from 'firebase/app';
import { getAuth, Auth, AuthError } from 'firebase/auth';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private messages: Message[] = [];
  private messageAnswers: MessageAnswer[] = [];
  chatStartedBy: User | null = null; // Aktualisiert auf User | null
  chats: Chat[] = [];
  auth: Auth;
  firestore: Firestore;
  date!: string;
  time!: string;

  constructor(private router: Router, ) {
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
    const userAuthUID = sessionStorage.getItem('userAuthUID');
  
    if (!userAuthUID) {
      console.error('AuthUID im Session Storage nicht gefunden.');
      return undefined;
    }
  
    const userQuery = query(collection(this.firestore, 'users'), where('authUID', '==', userAuthUID));
    const userSnapshot = await getDocs(userQuery);
  
    const currentUserDoc = userSnapshot.docs[0];
  
    if (!currentUserDoc) {
      console.error('Aktueller Benutzer nicht in der users-Sammlung gefunden.');
      return undefined;
    }
  
    const currentUserData = currentUserDoc.data();
  
    return {
      id: currentUserData['id'],
      authUID: currentUserData['authUID'],
      name: currentUserData['name'],
      status: currentUserData['status'],
      avatarURL: currentUserData['avatarURL'],
      photoURL: currentUserData['photoURL'],
      channels: currentUserData['channels'],
      email: currentUserData['email'],
      // ... weitere Eigenschaften
    } as User;
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

  async getChats(): Promise<Chat[]> {
    const chatsQuery = collection(this.firestore, 'chats');
  
    try {
      const currentUser = await this.getCurrentUser();
  
      if (!currentUser) {
        console.error('Aktueller Benutzer nicht gefunden.');
        return [];
      }
  
      const chatsSnapshot = await getDocs(chatsQuery);
  
      this.chats = chatsSnapshot.docs
        .map((doc) => {
          const chatData: DocumentData = doc.data();
  
          // Überprüfen, ob 'participants' im Chat-Dokument ein Array ist
          if (Array.isArray(chatData['participants'])) {
            const participants: User[] = [];
  
            // Durchsuche die participants und filtere nach dem aktuellen Nutzer
            for (const participant of chatData['participants']) {
              participants.push(participant);
            }
  
            // Füge das Chat-Dokument mit den gefilterten participants zur Liste hinzu
            return {
              id: doc.id,
              participants: participants,
              messages: chatData['messages'] || [],
              date: '',
              time: '',
              chatStartedBy: {
                id: '',
                authUID: '',
                name: '',
                status: false,
                avatarURL: '',
                photoURL: '',
                channels: [],
                email: ''
              } // Assign an empty object instead of null
            } as Chat;
          }
  
          return undefined; // Rückgabewert für den Fall, dass die Bedingung nicht erfüllt ist
        })
        .filter((chat): chat is Chat => chat !== undefined); // Filtere undefined-Werte aus
  
      return this.chats;
    } catch (error) {
      console.error('Fehler beim Laden der Chats:', error);
      return [];
    }
  }
  
  

  async getChatsByParticipant(authUID: string): Promise<Chat[]> {
    const chatsQuery = query(
      collection(this.firestore, 'chats'),
      where('participants', 'array-contains-any', [authUID])
    );
    const chatsSnapshot = await getDocs(chatsQuery);
  
    const currentUser = await this.getCurrentUser();
  
    if (!currentUser) {
      console.error('Aktueller Benutzer nicht gefunden.');
      return [];
    }
  
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
            // Überprüfe, ob der Benutzer bereits in der Liste ist, bevor er hinzugefügt wird
            if (!participants.some((participant) => participant.authUID === currentUser.authUID)) {
              // Add the current user to the participants list
              participants.push(currentUser);
            }
          }
  
          // Füge das Chat-Dokument mit den gefilterten participants zur Liste hinzu
          const filteredChat: Chat = {
            id: doc.id,
            participants: participants,
            messages: chatData['messages'] || [],
            date: '',
            time: '',
            chatStartedBy: {
              id: '',
              authUID: '',
              name: '',
              status: false,
              avatarURL: '',
              photoURL: '',
              channels: [],
              email: ''
            } // Assign an empty object instead of null
          };
  
          chats.push(filteredChat);
        }
      })
    );
  
    return chats;
  }

  
async loadChats() {
  try {
    console.log('Lade Chats...');
    await this.getChats();
    console.log('Chats erfolgreich geladen:', this.chats);
  } catch (error) {
    console.error('Fehler beim Laden der Chats:', error);
  }
}


}
