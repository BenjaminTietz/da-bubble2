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

@Component({
  selector: 'app-private-messages',
  templateUrl: './private-messages.component.html',
  styleUrl: './private-messages.component.scss',
})
export class PrivateMessagesComponent implements OnInit, OnDestroy {
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
this: any;

  constructor(
    private route: ActivatedRoute,
    public dialog: MatDialog,
    public chatService: ChatService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.chatId = params['id'];
      this.unsubMessages = this.subMessagesList(this.chatId); // Timo
      this.getChatDataById(this.chatId);
    });
    this.storedUserAuthUID = sessionStorage.getItem('userAuthUID');
    this.getUser();
  }

  ngOnDestroy(): void {
    this.unsubMessages();
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
    return collection(this.chatService.firestore, 'chats', chat_id, 'messages');
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
      messageAnwser: obj.messageAnswer || '',
      reactions: obj.reactions || '',
    };
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
      messageSendBy: this.getUserObjectForFirestore(),
      messageAnwser: [],
      reactions: [],
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
      messageAnwser: [],
      reactions: []
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





}





