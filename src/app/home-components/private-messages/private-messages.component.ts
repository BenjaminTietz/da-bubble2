import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import {
  getFirestore,
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
  getDoc,
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
import { UserDetailComponent } from '../dialogs/user-detail/user-detail.component';
import { Answer } from '../../../models/answer.class';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { EmojiComponent } from '@ctrl/ngx-emoji-mart/ngx-emoji';


@Component({
  selector: 'app-private-messages',
  templateUrl: './private-messages.component.html',
  styleUrl: './private-messages.component.scss',
})
export class PrivateMessagesComponent implements OnInit, OnDestroy {
[x: string]: any;
  chatId: any;
  selectedUsers: User[] = [];
  messageText: string = '';
  chatData: Chat | undefined;
  messages: Message[] = [];
  //neu
  unsubMessages!: () => void;
  listMessages: any = [];
  newMessage: Message = new Message();
  storedUserAuthUID: any;
  user: User = new User();
  firestore: Firestore = inject(Firestore);

  //edit message
  editMessageText: string = '';
  editingMessageId: string | null = null;
 
  //answers
  showAnswers: boolean = false;
  messageDetail: number = 0;
  unsubAnswers!: () => void;
  listAnswers: any[] = [];
  dataLoaded: boolean = false;
  newAnswer: MessageAnswer = new MessageAnswer();
  unsubPosts!: () => void;
  listPosts: any = [];
  postDetail: number = 0; //prüfen auf welche Nummer initial setzen
  

  // emoji
  showEmojiPicker = false;


  constructor(
    private route: ActivatedRoute,
    public dialog: MatDialog,
    public chatService: ChatService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.chatId = params['id'];
      this.unsubMessages = this.subMessagesList(this.chatId); 
      //  this.unsubAnswers = this.subAnswersList(this.chatId,this['messageId']);    Funktioniert nicht
      this.getChatDataById(this.chatId);
    });
    this.storedUserAuthUID = sessionStorage.getItem('userAuthUID');
    this.getUser();
  }

  ngOnDestroy(): void {
    this.unsubMessages();
    this.unsubAnswers();
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

  //Sucbscribe to the messages subcollection with chatId
  subMessagesList(chat_id: any) {
    const q = query(
      this.getMessageSubcollectionRef(chat_id),
      where('chatId', '==', chat_id),
      orderBy('date'),
      orderBy('time')
    );
    return onSnapshot(q, (list) => {
      this.listMessages = [];
      list.forEach((element) => {
        this.listMessages.push(
          this.setMessageObject(element.data(), element.id)
        );
      });
    });
  }

  getMessageSubcollectionRef(chat_id: any) {
    return collection(this.firestore, 'chats', chat_id, 'messages');
  }

  setMessageObject(obj: any, id: string): Message {
    return {
      id: id || '',
      text: obj.text || '',
      chatId: obj.chatId || '',
      user: obj.user || this.user,
      date: obj.date || this.getCurrentDate(),
      time: obj.time || this.getCurrentTime(),
      messageSendBy: obj.messageSendBy || this.getUserObjectForFirestore(),
      messageAnswer: obj.messageAnswer || [], 
      reactions: obj.reactions || [],
    };
  }

  async addMessage(chat_id: any) {
    await this.getUser();

    // Create a new message object
    const newMessage: Message = {
      id: '',
      text: this.messageText,
      chatId: this.chatId,
      user: this.getUserObjectForFirestore(), 
      date: this.getCurrentDate(),
      time: this.getCurrentTime(),
      messageSendBy: this.getUserObjectForFirestore(),
      reactions: [],
      messageAnswer: []
    };

    // Add the new message to the Firestore subcollection
    try {
      const docRef = await addDoc(
        this.getMessageSubcollectionRef(chat_id),
        this.setMessageObject(newMessage, '')
      );
      console.log('Message written with ID: ', docRef.id);
      console.log('Chat ', chat_id);

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
    await updateDoc(docRef, { id: newId })
      .catch((err) => {
        console.log(err);
      })
      .then(() => { });
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

  getParticipantInfo(participant: User): string {
    return `${participant.name} (${participant.email})`;
  }

  async getChatDataById(chatId: string) {
    console.log('Loading chat data for ID:', chatId);
    try {
      // Use the doc reference directly in the query
      const chatDocRef = doc(this.firestore, 'chats', chatId);
      const chatSnapshot = await getDoc(chatDocRef);

      // Check if the chat was found
      if (chatSnapshot.exists()) {
        const chatData: DocumentData = chatSnapshot.data();
        console.log('Chat data:', chatData);

        // Extract participants and assign them to selectedUsers
        this.selectedUsers = chatData['participants'] as User[];
        this.dataLoaded = true;
        return chatData as Chat;
      } else {
        console.error('Chat not found.');
        return null;
      }
    } catch (error) {
      console.error('Error loading chat data:', error);
      return null;
    }
  }


  logMessageData(messageId: string) {

    console.log('Clicked on message with ID:', messageId);
    console.log(
      'Message:',
      this.listMessages.find(
        (message: { id: string }) => message.id === messageId
      )
    );
  }

  // edit message

  editMessage(messageId: string) {
    // logik zum öffnen nur für verfasser der message implementieren

    const messageToEdit = this.listMessages.find(
      (message: { id: string }) => message.id === messageId
    );

    if (messageToEdit) {
      this.editMessageText = messageToEdit.text;
      this.editingMessageId = messageId;

      console.log('Editing message:', messageId);
      console.log('Original Message:', messageToEdit);
    }
  }


  async saveEditedMessage() {
    if (!this.editingMessageId) {
      console.error('No message being edited.');
      return;
    }


    const existingMessage = this.listMessages.find(
      (message: { id: string }) => message.id === this.editingMessageId
    );

    if (!existingMessage) {
      console.error('Original message not found.');
      return;
    }

    const editedMessage: Message = {
      id: this.editingMessageId,
      text: this.editMessageText,
      chatId: this.chatId,
      user: this.getUserObjectForFirestore(),
      date: existingMessage.date,
      time: existingMessage.time,
      messageSendBy: this.getUserObjectForFirestore(),
      reactions: [],
      messageAnswer: []
    };

    try {

      await updateDoc(
        doc(this.getMessageSubcollectionRef(this.chatId), this.editingMessageId),
        editedMessage
      );

      console.log('Message updated successfully:', editedMessage);
      this.editingMessageId = null;
    } catch (error) {
      console.error('Error updating message:', error);
    }
  }


  cancelEditingMessage() {
    this.editingMessageId = null;
  }

  // edit message end




  //Code Timo

  openDialogProfile(user: any): void {
    const dialog = this.dialog.open(UserDetailComponent, {
      position: {
        top: '32px',
        right: '32px'
      },
      maxWidth: '100%',
      panelClass: 'dialog-profile-detail'

    });
    dialog.componentInstance.user = new User(user);
  }


  async openAnswers(chat_id: any, message: any, i: any) {
    console.log(message);
    this.showAnswers = true;
    this.messageDetail = i;
    this.unsubAnswers = this.subAnswersList(chat_id, message.id);
    console.log(this.listAnswers);
    console.log(this.messageDetail);
    console.log(this.showAnswers);
  }

  subAnswersList(chat_id: any, message_id: any) {
    const q = query(
      this.getMessageAnswerSubcollectionRef(chat_id, message_id),
      orderBy('date'),
      orderBy('time')
    );
  
    return onSnapshot(q, (list) => {
      this.listAnswers = [];
      list.forEach((element) => {
        const answerData = element.data();
        // Überprüfen, ob das Antwortobjekt die erwartete Struktur hat
        if ('content' in answerData && 'user' in answerData && 'date' in answerData && 'time' in answerData) {
          // Fügen Sie das Antwortobjekt zur Liste der Antworten hinzu
          this.listAnswers.push(this.setAnswerObject(answerData));
        }
      });
      console.log('listAnswers:', this.listAnswers); // Debugging-Ausgabe
    });
  }

  getAnswerSubcollectionRef(chat_id: any, message_id: any) {
    return collection(this.firestore,'chats', chat_id, 'messages', message_id)
  }

  getMessageAnswerSubcollectionRef(chat_id: string, message_id: string) {
    return collection(
      this.firestore,
      'chats',
      chat_id,
      'messages',
      message_id,
      'messageAnswer'
    );
  }

  setAnswerObject(obj: any) {
    return {
      id: obj.id || '',
      content: obj.content || '',
      user: obj.user || this.user,
      postId: obj.postId || '',
      date: obj.date || '',
      time: obj.time || '',
      reactions: obj.reactions || [],
    };
  }

    //Code für Answers


    createAnswer(chat_id: any, message: any) {
      if (this.newAnswer['content']) {
        console.log('Creating answer...');
        console.log('Message ID:', message.id);
        console.log('New answer content:', this.newAnswer['content']);
        this.newAnswer.user = this.user;
        this.newAnswer.date = this.getCurrentDate();
        this.newAnswer.time = this.getCurrentTime();
        this.newAnswer['id'] = message.id; 
    
        // Die Antwort in die Subcollection messageAnwser speichern
        addDoc(
          this.getMessageAnswerSubcollectionRef(chat_id, message.id), // chat_id und message.id verwenden
          this.setAnswerObject(this.newAnswer)
        ).then((docRef) => {
          this.newAnswer['content'] = '';
          const newID = docRef?.id;
          // Aktualisieren Sie die Anzahl der Antworten der Nachricht
          this.updatePostAmountAnswers(message.id, this.listAnswers.length, chat_id);
          // Aktualisieren Sie die Antwort mit ihrer ID
          this.updateAnswerWithId(message.id, newID, chat_id);
        });
      }
    }


getAnswersForMessage(chat_id: string, message_id: string) {
  const q = query(
      this.getMessageAnswerSubcollectionRef(chat_id, message_id)
  );
  return onSnapshot(q, (querySnapshot) => {
      const answers: { id: string; }[] = [];
      querySnapshot.forEach((doc) => {
          answers.push({ id: doc.id, ...doc.data() });
      });
      console.log("Answers for message: ", answers);

  });
}

  
async updateAnswerWithId(messages_id: any, newId: any, chat_id: any) {
  const docRef = doc(this.getAnswerSubcollectionRef(chat_id, messages_id), newId);
  await updateDoc(docRef, { id: newId }).catch(
    (err) => { console.log(err); }
  ).then(
    () => { }
  );
}

async updatePostAmountAnswers(messages_id: any, amount: any, chat_id: any) {
  const docRef = doc(this.getPostSubcollectionRef(chat_id), messages_id);
  await updateDoc(docRef, { answers: amount }).catch(
    (err) => { console.log(err); }
  ).then(
    () => { }
  );
}

    getPostSubcollectionRef(chat_id: any) {
      return collection(this.firestore, 'chats', chat_id, 'messages')
    }
  
    hideAnswers() {
      this.showAnswers = false;
      this.unsubAnswers();
    }
  
    
    //Ende Code für Post als Subcollection


    // emoji
    addEmoji(event: any, chatId: string, messageId: string) {
      // Extrahieren Sie den ausgewählten Emoji aus dem Event
      const selectedEmoji = event.emoji;
    
      // Erstellen Sie ein neues Reaktionsobjekt
      const newReaction = {
        emoji: selectedEmoji,
        userId: this.user.id, // Annahme: Der aktuelle Benutzer führt die Reaktion durch
        date: this.getCurrentDate(),
        time: this.getCurrentTime()
      };
    
      // Fügen Sie das Reaktionsobjekt als neues Dokument in die Unter-Subcollection "reactions" ein
      addDoc(
        this.getReactionsSubcollectionRef(chatId, messageId),
        newReaction
      )
      .then((docRef) => {
        console.log('Reaction added successfully:', docRef.id);
      })
      .catch((error) => {
        console.error('Error adding reaction:', error);
      });
    }

    
getReactionsSubcollectionRef(chatId: string, messageId: string) {
  return collection(
    this.firestore,
    'chats',
    chatId,
    'messages',
    messageId,
    'reactions'
  );
}
    
}





