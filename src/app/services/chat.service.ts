import { Injectable } from '@angular/core';
import { Message } from '../../models/message.class';
import { MessageAnswer } from '../../models/messageAnswer.class';
import { User } from '../../models/user.class';
import { getFirestore, Firestore, collection, query, where, getDocs, CollectionReference, DocumentData, addDoc, doc, DocumentReference } from 'firebase/firestore';
import { Chat } from '../../models/chat.class';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private messages: Message[] = [];
  private messageAnswers: MessageAnswer[] = [];
  private firestore: Firestore = getFirestore();

  constructor() {
    // Hier könntest du Nachrichten und Antworten initial laden
    // Beispiel:
    // this.messages = this.loadMessagesFromDatabase();
    // this.messageAnswers = this.loadMessageAnswersFromDatabase();
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
}
