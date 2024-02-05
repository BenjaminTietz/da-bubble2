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
  messageId: any;
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


  unsubAnswers!: () => void;
  listAnswers: any[] = [];
  newAnswer: MessageAnswer = new MessageAnswer();

  dataLoaded: boolean = false;
  answerDetail: number = 0; //prüfen auf welche Nummer initial setzen



  // emoji
  emojiPickerVisible: boolean = false;
  emojiPickerAnswerVisible: boolean = false;
  selectedEmoji: string = '';


  constructor(
    private route: ActivatedRoute,
    public dialog: MatDialog,
    public chatService: ChatService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.chatId = params['id'];
      this.unsubMessages = this.subMessagesList(this.chatId);
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
      avatarURL: obj.avatarURL || '', 
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
      messageAnswer: [],
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
      .then(() => {});
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
      messageAnswer: [],
    };

    try {
      await updateDoc(
        doc(
          this.getMessageSubcollectionRef(this.chatId),
          this.editingMessageId
        ),
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
        right: '32px',
      },
      maxWidth: '100%',
      panelClass: 'dialog-profile-detail',
    });
    dialog.componentInstance.user = new User(user);
  }

  async openAnswers(chat_id: any, message_id: any, i: any) {
    console.log('Chat_ID',chat_id);
    console.log('Message_ID',message_id);
    console.log('Index',i);

    this.showAnswers = true;
    this.answerDetail = i;
    this.unsubAnswers = this.subMessageAnswersList(chat_id, message_id);
  }

  //Subscribe to the messageAnswer subcollection with chatId & messageId
  
  subMessageAnswersList(chat_id: any, message_id: any) {
    const q = query(this.getMessageAnswerSubcollectionRef(chat_id, message_id), orderBy('date'), orderBy('time'));
    return onSnapshot(q, (list) => {
      this.listAnswers = [];
      list.forEach(element => {
        this.listAnswers.push(this.setAnswerObject(element.data()));
      });
      console.log('ListAnswers',this.listAnswers);
    });
  }
    
  getMessageAnswerSubcollectionRef(chat_id: any, message_id: any) {
    return collection(this.firestore, 'chats', chat_id, 'messages', message_id, 'messageAnswer')
  }

  setAnswerObject(obj: any) {
    return new MessageAnswer({
        id: obj.id || "",
        text: obj.content || "",
        messageId: obj.postId || "",
        user: this.setUserObject(obj.user),
        date: obj.date || "",
        time: obj.time || "",
        reactions: obj.reactions || [],
    });
}

  //Code für Answers

  createAnswer(chatId: string) {

    console.log('Chat ID:', chatId);
    const newAnswer = {
      content: this.newAnswer['content'],
      userId: this.user.id, // Nur die Benutzer-ID speichern
      date: this.getCurrentDate(),
      time: this.getCurrentTime()
    };
  
    const messageAnswerRef = this.getMessageAnswerSubcollectionRef(chatId, this.messageId);
    
    if (messageAnswerRef) {
      addDoc(messageAnswerRef, newAnswer)
        .then((docRef) => {
          console.log('Answer added successfully:', docRef.id);
          this.newAnswer['content'] = '';
        })
        .catch((error) => {
          console.error('Error adding answer:', error);
        });
    } else {
      console.error('Invalid messageAnswerRef:', messageAnswerRef);
    }
  }
  
  
  

  


  hideAnswers() {
    this.showAnswers = false;
    this.unsubAnswers();
  }

  //Ende Code für Post als Subcollection

  // emoji
  addReaction(event: any, chatId: string) {
    const selectedEmoji = event.emoji;
    const newReaction = {
      emoji: selectedEmoji,
      userId: this.user.id,
      date: this.getCurrentDate(),
      time: this.getCurrentTime(),
    };
  
    addDoc(this.getReactionsSubcollectionRef(chatId, this.messageId), newReaction)
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

  toggleEmojiPicker() {
    this.emojiPickerVisible = !this.emojiPickerVisible;
  }

  selectEmoji(event: any) {
    const selectedEmoji = event.emoji.native; 
    this.messageText += selectedEmoji;
  }

  toggleSetEmojiPicker() {
    this.emojiPickerAnswerVisible = !this.emojiPickerAnswerVisible;
  }
}
