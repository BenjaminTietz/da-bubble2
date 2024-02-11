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
import { Router } from '@angular/router';
import { Chat } from '../../../models/chat.class';
import { User } from '../../../models/user.class';
import { updateDoc } from 'firebase/firestore';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Message } from '../../../models/message.class';
import { MessageAnswer } from '../../../models/messageAnswer.class';
import { ChatService } from '../../services/chat.service';
import { Firestore, onSnapshot } from '@angular/fire/firestore';
import { UserDetailComponent } from '../dialogs/user-detail/user-detail.component';
import { Answer } from '../../../models/answer.class';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { EmojiComponent } from '@ctrl/ngx-emoji-mart/ngx-emoji';
import { UserService } from '../../services/user.service';

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


  unsubAnswers: (() => void) | null = null;
  listAnswers: any[] = [];
  newAnswer: string = '';

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
    private router: Router,
    public UserService: UserService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.chatId = params['id'];
      this.unsubMessages = this.subMessagesList(this.chatId);
      //this.unsubAnswers = this.subMessageAnswersList(this.chatId, this.messageId);
      this.getChatDataById(this.chatId);
    });
    this.storedUserAuthUID = sessionStorage.getItem('userAuthUID');
    this.UserService.getUser();
  }

  ngOnDestroy(): void {
    this.unsubMessages();
    this.unsubMessages();
    if (this.unsubAnswers) {
      this.unsubAnswers();
    }
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
      date: obj.date || this.UserService.getCurrentDate(),
      time: obj.time || this.UserService.getCurrentTime(),
      messageSendBy: obj.messageSendBy || this.UserService.getUserObjectForFirestore(),
      messageAnswer: obj.messageAnswer || [],
      reactions: obj.reactions || [],
    };
  }

  async addMessage(chat_id: any) {
    await this.UserService.getUser();

    if (!this.messageText) {
      console.error('No message text.');
      return;
    }
    // Create a new message object
    const newMessage: Message = {
      id: '',
      text: this.messageText,
      chatId: this.chatId,
      user: this.UserService.getUserObjectForFirestore(),
      date: this.UserService.getCurrentDate(),
      time: this.UserService.getCurrentTime(),
      messageSendBy: this.UserService.getUserObjectForFirestore(),
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


  async updateMessageWithId(newId: any, chat_id: any) {
    const docRef = doc(this.getMessageSubcollectionRef(chat_id), newId);
    await updateDoc(docRef, { id: newId })
      .catch((err) => {
        console.log(err);
      })
      .then(() => {});
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
    // Logik zum Öffnen nur für Verfasser der Nachricht implementieren
    const messageToEdit = this.listMessages.find(
      (message: { id: string; user: { authUID: string } }) => {
        // Überprüfen, ob die Nachricht-ID übereinstimmt und der aktuelle Nutzer der Verfasser ist
        return message.id === messageId && message.user.authUID === this.storedUserAuthUID;
      }
    );
  
    if (messageToEdit) {
      this.editMessageText = messageToEdit.text;
      this.editingMessageId = messageId;
  
      console.log('Editing message:', messageId);
      console.log('Original Message:', messageToEdit);
    } else {
      console.log('User is not the author of the message or message not found.');
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
      user: this.UserService.getUserObjectForFirestore(),
      date: existingMessage.date,
      time: existingMessage.time,
      messageSendBy: this.UserService.getUserObjectForFirestore(),
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

    this.messageId = message_id;
    this.showAnswers = true;
    this.answerDetail = i;
    this.unsubAnswers = this.subMessageAnswersList(chat_id, message_id);
  }

  //Subscribe to the messageAnswer subcollection with chatId & messageId
  
  subMessageAnswersList(chat_id: any, message_id: any): () => void {
    console.log('subAnswersChat_ID', chat_id);
    console.log('subAnswersMessage_ID', message_id);
    const q = query(
      this.getMessageAnswerSubcollectionRef(chat_id, message_id),
      orderBy('date'),
      orderBy('time')
    );
    return onSnapshot(q, (list) => {
      // Zuerst die listAnswers leeren
      this.listAnswers = [];
      list.forEach(element => {
        this.listAnswers.push(this.setAnswerObject(element.data()));
      });
      console.log('ListAnswers', this.listAnswers);
  
      // Reaktionen für jede Nachricht abrufen und in listMessages speichern
      this.listMessages.forEach((message: any) => {
        const reactionsRef = this.getReactionsSubcollectionRef(chat_id, message.id);
        onSnapshot(reactionsRef, (reactionsSnapshot) => {
          const reactions: any[] = []; 
          reactionsSnapshot.forEach((doc) => {
            reactions.push(doc.data());
          });
          message.reactions = reactions;
        });
      });
    });
  }
  
    
  getMessageAnswerSubcollectionRef(chat_id: any, message_id: any) {
    return collection(this.firestore, 'chats', chat_id, 'messages', message_id, 'messageAnswer')
  }

  setAnswerObject(obj: any) {
    return new MessageAnswer({
      id: obj.id || "",
      text: obj.text || "",
      messageId: obj.messageId || "",
      user: obj.user ? this.UserService.setUserObject(obj.user) : {}, 
      date: obj.date || "",
      time: obj.time || "",
      reactions: obj.reactions || [],
    });
  }

  //Code für Answers

  async createAnswer(chatId: string, messageId: string) {
    console.log('createAnswer called.');
    console.log('Message ID:', messageId);
    console.log('Chat ID:', chatId);
    console.log('New answer is', this.newAnswer);
  
    if (!this.newAnswer) {
      console.error('No answer text.');
      return;
    }
  
    const newAnswer: MessageAnswer = {
      id: doc(collection(this.firestore, 'chats', chatId, 'messages', messageId, 'messageAnswer')).id,
      text: this.newAnswer,
      messageId: messageId,
      user: this.UserService.user,
      date: this.UserService.getCurrentDate(),
      time: this.UserService.getCurrentTime(),
      reactions: []
    };
  
    const newAnswerJson = JSON.parse(JSON.stringify(newAnswer));
  
    const messageAnswerRef = this.getMessageAnswerSubcollectionRef(chatId, messageId);
  
    console.log('Message Answer Reference:', messageAnswerRef);
  
    if (messageAnswerRef) {
      addDoc(messageAnswerRef, newAnswerJson)
      .then((docRef) => {
        console.log('Answer added successfully:', docRef.id);
        // Set the ID of the new answer
        newAnswer.id = docRef.id; // <-- Set the ID here
        //this.listAnswers.push(newAnswer);
        this.newAnswer = ''; 
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
    if (this.unsubAnswers) {
      this.unsubAnswers();
    }
  }


  // emoji
  addReaction(event: any, chatId: string) {
    const selectedEmoji = event.emoji;
    const newReaction = {
      emoji: selectedEmoji,
      userId: this.user.id, 
      date: this.UserService.getCurrentDate(),
      time: this.UserService.getCurrentTime(),
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
