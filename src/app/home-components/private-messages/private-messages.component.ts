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
  deleteDoc,
  runTransaction
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
import { Emoji } from '../../../models/emoji.class';
import { Reaction } from '../../../models/reaction.class';

@Component({
  selector: 'app-private-messages',
  templateUrl: './private-messages.component.html',
  styleUrl: './private-messages.component.scss',
})
export class PrivateMessagesComponent implements OnInit, OnDestroy {
  [x: string]: any;
  chatId: any;
  messageId: any;
  messageAnswerId: any;
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

    //edit messageAnswer
    editMessageAnswerText: string = '';
    editingMessageAnswerId: string | null = null;
  
  //answers
  showAnswers: boolean = false;


  unsubAnswers: (() => void) | null = null;
  listAnswers: any[] = [];
  newAnswer: string = '';

  dataLoaded: boolean = false;
  answerDetail: number = 0; //prüfen auf welche Nummer initial setzen



  // emoji Messages
  emojiPickerVisible: boolean = false;
  emojiPickerMessagesVisible: boolean = false;
  selectedEmoji: string = '';
  messageEmoji: number = 0;
  newReaction: Reaction = new Reaction();

// emoji MessageAnswers
    emojiPickerAnswerVisible: boolean = false;
    messageAnswerEmoji: number = 0;

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
    this.getUserByService();
  }

  async getUserByService() {
    const user = await this.UserService.getUser();
    if (user) {
      this.user = user;
      console.log(this.user);
    }
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
    orderBy('date')
  );
  return onSnapshot(q, async (snapshot) => {
    this.listMessages = [];
    const docs = snapshot.docs; 
    for (const doc of docs) {
      const messageData = doc.data();
      const message = this.setMessageObject(messageData, doc.id);
      this.listMessages.push(message);
    }
    console.log('listmessages', this.listMessages);
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
      user: obj.user || this.UserService.user,
      date: obj.date || this.UserService.getCurrentDate(),
      time: obj.time || this.UserService.getCurrentTime(),
      messageSendBy: obj.messageSendBy || this.UserService.getUserObjectForFirestore(),
      messageAnswer: obj.messageAnswer || [],
      reactions: obj.reactions || [],
    };
  }

  async addMessage(chat_id: any) {
    await this.getUserByService();
    if (!this.messageText) {
      console.error('No message text.');
      return;
    }
  
    const userObject = await this.UserService.getUserObjectForFirestore();
    if (!userObject) {
      console.error('Failed to get user object.');
      return;
    }
  
    const newMessage: Message = {
      id: '',
      text: this.messageText,
      chatId: this.chatId,
      user: userObject,
      date: new Date().toISOString(),
      time: this.UserService.getCurrentTime(),
      messageSendBy: userObject,
      reactions: [],
      messageAnswer: [],
    };
  
    try {
      const docRef = await addDoc(
        this.getMessageSubcollectionRef(chat_id),
        this.setMessageObject(newMessage, '')
      );
      console.log('Message written with ID: ', docRef.id);
      console.log('Chat ', chat_id);
  
      const newID = docRef.id;
  
      await this.updateMessageWithId(newID, chat_id);
  
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
  
    const userObject = await this.UserService.getUserObjectForFirestore();
    if (!userObject) {
      console.error('Failed to get user object.');
      return;
    }
  
    const editedMessage: Message = {
      id: this.editingMessageId,
      text: this.editMessageText,
      chatId: this.chatId,
      user: userObject,
      date: existingMessage.date,
      time: existingMessage.time,
      messageSendBy: userObject,
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
    this.editingMessageAnswerId = null; 
  }

  async deleteMessage(messageId: string) {
    try {
      // Überprüfen, ob die Nachricht vorhanden ist
      const messageDocRef = doc(this.getMessageSubcollectionRef(this.chatId), messageId);
      const messageSnapshot = await getDoc(messageDocRef);
  
      if (messageSnapshot.exists()) {
        // Nachricht existiert, also löschen
        await deleteDoc(messageDocRef);
        console.log('Message deleted successfully:', messageId);
      } else {
        console.error('Message not found.');
      }
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  }

  async deleteMessageAnswer(messageId: string, answerId: string) {
    console.log('Deleting message answer:', answerId);
    console.log('Message ID:', messageId);
    try {
      // Referenz zur Nachricht in der Hauptsammlung und zur Nachrichtenantwort in der Subsammlung
      const messageDocRef = doc(this.getMessageSubcollectionRef(this.chatId), messageId);
      const answerDocRef = doc(collection(messageDocRef, 'messageAnswer'), answerId);
      
      // Überprüfen, ob die Nachrichtenantwort vorhanden ist
      const answerSnapshot = await getDoc(answerDocRef);
      if (answerSnapshot.exists()) {
        // Nachrichtenantwort existiert, also löschen
        await deleteDoc(answerDocRef);
        console.log('Message answer deleted successfully:', answerId);
      } else {
        console.error('Message answer not found.');
      }
    } catch (error) {
      console.error('Error deleting message answer:', error);
    }
  }
  
  editMessageAnswer(messageId: string, answerId: string) {
    // Logik zum Öffnen nur für den Verfasser der Antwort implementieren
    const answerToEdit = this.listAnswers.find(
      (answer: { id: string; user: { authUID: string } }) => {
        // Überprüfen, ob die Antwort-ID übereinstimmt und der aktuelle Nutzer der Verfasser ist
        return answer.id === answerId && answer.user.authUID === this.storedUserAuthUID;
      }
    );
  
    if (answerToEdit) {
      this.editMessageAnswerText = answerToEdit.text;
      this.editingMessageId = messageId;
      this.editingMessageAnswerId = answerId;
  
      console.log('Editing message answer:', answerId);
      console.log('Original Message Answer:', answerToEdit);
    } else {
      console.log('User is not the author of the message answer or answer not found.');
    }
  }

  async saveEditedMessageAnswer() {
    if (!this.editingMessageAnswerId) {
      console.error('No message answer being edited.');
      return;
    }
  
    const existingAnswer = this.listAnswers.find(
      (answer: { id: string }) => answer.id === this.editingMessageAnswerId
    );
  
    if (!existingAnswer) {
      console.error('Original message answer not found.');
      return;
    }
  
    const userObject = await this.UserService.getUserObjectForFirestore();
    if (!userObject) {
      console.error('Failed to get user object.');
      return;
    }
  
    const editedAnswer: MessageAnswer = {
      id: existingAnswer.id,
      text: this.editMessageAnswerText,
      messageId: existingAnswer.messageId,
      user: userObject,
      date: existingAnswer.date,
      time: existingAnswer.time,
      messageSendBy: userObject,
      reactions: [],
    };
  
    try {
      await updateDoc(
        doc(
          this.getMessageAnswerSubcollectionRef(this.chatId, this.editingMessageId),
          this.editingMessageAnswerId
        ),
        editedAnswer
      );
  
      console.log('Message answer updated successfully:', editedAnswer);
      this.editingMessageId = null;
      this.editingMessageAnswerId = null;
    } catch (error) {
      console.error('Error updating message answer:', error);
    }
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
      orderBy('date')
    );
    return onSnapshot(q, (list) => {
      // Zuerst die listAnswers leeren
      this.listAnswers = [];
      list.forEach(element => {
        this.listAnswers.push(this.setAnswerObject(element.data()));
      });
      console.log('ListAnswers', this.listAnswers);
    });
  }
  
    
  getMessageAnswerSubcollectionRef(chat_id: any, message_id: any) {
    const messageRef = doc(this.firestore, 'chats', chat_id, 'messages', message_id);
    return collection(messageRef, 'messageAnswer');
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

  async createAnswer(chatId: string, messageId: string) {
    if (!this.newAnswer) {
      console.error('No answer text.');
      return;
    }
  
    try {
      const userObject = await this.UserService.getUserObjectForFirestore();
      if (!userObject) {
        console.error('Failed to get user object.');
        return;
      }
  
      const newAnswer: MessageAnswer = {
        text: this.newAnswer,
        messageId: messageId,
        user: userObject,
        date: new Date().toISOString(),
        time: this.UserService.getCurrentTime(),
        reactions: [],
        id: ''
      };
  
      const newAnswerJson = JSON.parse(JSON.stringify(newAnswer));
  
      const messageAnswerRef = this.getMessageAnswerSubcollectionRef(chatId, messageId);
  
      console.log('Message Answer Reference:', messageAnswerRef);
  
      if (messageAnswerRef) {
        const docRef = await addDoc(messageAnswerRef, newAnswerJson);
        console.log('Answer added successfully:', docRef.id);
  
        await this.updateAnswerWithId(docRef, { id: docRef.id });
  
        this.newAnswer = ''; 
      } else {
        console.error('Invalid messageAnswerRef:', messageAnswerRef);
      }
    } catch (error) {
      console.error('Error adding answer:', error);
    }
  }
  

async updateAnswerWithId(docRef: DocumentReference<DocumentData>, data: any) {
    await updateDoc(docRef, data)
      .then(() => {})
      .catch((err) => {
        console.error('Error updating answer:', err);
      });
}
 

  hideAnswers() {
    this.showAnswers = false;
    if (this.unsubAnswers) {
      this.unsubAnswers();
    }
  }

    //Code für Reactions für Messages

    reactMessage(chat_id: any, message: any, i: any) {
      console.log('Chat_ID', chat_id);
      console.log('Message_ID', message.id);
      console.log('Index', i);
      this.toggleEmojiPicker(i);
    }

    selectEmoji($event: { emoji: { native: string } }, i: any, chat_id: any, message_id: any) {
      const emoji = $event.emoji.native
      console.log('Emoji', emoji);
      console.log('Chat_ID', chat_id);
      console.log('Message_ID', message_id);
      console.log('Index', i);
      this.addEmojiToFirebase(chat_id, message_id, i, emoji)
    }
  
  
    toggleEmojiPicker(i: any) {
      this.emojiPickerMessagesVisible = !this.emojiPickerMessagesVisible;
      this.messageEmoji = i;
    }

    addEmojiToFirebase(chat_id: any, message_id: any, i: any, emoji: any) {

      this.newReaction.post_id = message_id;
      this.newReaction.user = this.UserService.setUserObject(this.user);
      this.newReaction.amount = 1;
      this.newReaction.emoji = emoji;
  
      this.addOrUpdateReaction(chat_id, message_id, this.setReactionObject(this.newReaction)).then(() => {
        this.toggleEmojiPicker(i);
      })
    }
  
    async addOrUpdateReaction(chat_id: any, message_id: any, newReaction: any) {

      await runTransaction(this.firestore, async (transaction) => {
        const postDoc = await transaction.get(this.getMessageDocRef(chat_id, message_id))
        const post = postDoc.data();
  
        if (!post) {
          console.log("Message-Daten nicht gefunden!")
        } else {
  
          const existingReactionIndex = post['reactions'].findIndex((r: any) => r.emoji === newReaction.emoji);
  
          if (existingReactionIndex !== -1) {
            const updatedReactions = [...post['reactions']];
            updatedReactions[existingReactionIndex] = { ...updatedReactions[existingReactionIndex], amount: updatedReactions[existingReactionIndex].amount + 1 };
            transaction.update(this.getMessageDocRef(chat_id, message_id), { reactions: updatedReactions });
          } else {
            const updatedReactions = [...post['reactions'], newReaction];
            transaction.update(this.getMessageDocRef(chat_id, message_id), { reactions: updatedReactions })
          }
        }
      })
    }

    setReactionObject(obj: any) {
      return {
        id: obj.id || "",
        user: obj.user || "",
        emoji: obj.emoji || "",
        post_id: obj.message_id || "",
        answer_id: obj.answer_id || "",
        amount: obj.amount || 0
  
      }
    }

    getMessageDocRef(chat_id: any, message_id: any) {
      return doc(this.firestore, "chats", chat_id, "messages", message_id);
    }

    addReactionMessage(chat_id: any, message: any, i: any, reaction: any) {
      this.newReaction.post_id = message.id;
      this.newReaction.user = this.UserService.setUserObject(this.user);
      this.newReaction.amount = 1;
      this.newReaction.emoji = reaction.emoji;
  
      this.addOrUpdateReaction(chat_id, message.id, this.setReactionObject(this.newReaction)).then(() => {
        if (this.emojiPickerAnswerVisible) {
          this.toggleEmojiPicker(i);
        }
      })
    }


    //Code für Reactions für MessageAnswers

    reactMessageAnswer(message_id: any, answer: any, i: any) {
      this.toggleEmojiPickerAnswer(i);
    }

    toggleEmojiPickerAnswer(i: any) {
      this.emojiPickerAnswerVisible = !this.emojiPickerAnswerVisible;
      this.messageAnswerEmoji = i;
    }

    selectEmojiAnswer($event: { emoji: { native: string } }, i: any, chat_id: any, answer: any) {
      const emoji = $event.emoji.native
      this.addEmojiToFirebaseAnswer(chat_id, answer, i, emoji)
    }

    addEmojiToFirebaseAnswer(chat_id: any, answer: any, i: any, emoji: any) {
      this.newReaction.answer_id = answer.id;
      this.newReaction.user = this.UserService.setUserObject(this.user);
      this.newReaction.amount = 1;
      this.newReaction.emoji = emoji;
  
      this.addOrUpdateReactionAnswer(chat_id, answer, this.setReactionObject(this.newReaction)).then(() => {
        this.toggleEmojiPickerAnswer(i);
      })
    }

    async addOrUpdateReactionAnswer(chat_id: any, answer: any, newReaction: any) {
      await runTransaction(this.firestore, async (transaction) => {
        const answDoc = await transaction.get(this.getAnswerDocRef(chat_id, answer))
        const answ = answDoc.data();
  
        if (!answ) {
          console.log("Answer-Daten nicht gefunden!")
        } else {
  
          const existingReactionIndex = answ['reactions'].findIndex((r: any) => r.emoji === newReaction.emoji);
  
          if (existingReactionIndex !== -1) {
            const updatedReactions = [...answ['reactions']];
            updatedReactions[existingReactionIndex] = { ...updatedReactions[existingReactionIndex], amount: updatedReactions[existingReactionIndex].amount + 1 };
            transaction.update(this.getAnswerDocRef(chat_id, answer), { reactions: updatedReactions });
          } else {
            const updatedReactions = [...answ['reactions'], newReaction];
            transaction.update(this.getAnswerDocRef(chat_id, answer), { reactions: updatedReactions })
          }
        }
      })
    }

    getAnswerDocRef(chat_id: any, answer: any) {
      return doc(this.firestore, "chats", chat_id, "messages", answer.messageId, "messageAnswer", answer.id);
    }

    addReactionMessageAnswer(chat_id: any, answer: any, i: any, reaction: any) {
      this.newReaction.answer_id = answer.id;
      this.newReaction.user = this.UserService.setUserObject(this.user);
      this.newReaction.amount = 1;
      this.newReaction.emoji = reaction.emoji;
  
      this.addOrUpdateReactionAnswer(chat_id, answer, this.setReactionObject(this.newReaction)).then(() => {
        if (this.emojiPickerAnswerVisible) {
          this.toggleEmojiPickerAnswer(i);
        }
      })
    }
}

