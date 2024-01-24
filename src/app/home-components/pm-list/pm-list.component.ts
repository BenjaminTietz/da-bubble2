import { Component, HostListener, inject, OnDestroy, OnInit } from '@angular/core';
import { Firestore, collection, query, onSnapshot, where, getDocs } from '@angular/fire/firestore';
import { User } from '../../../models/user.class';
import { Chat } from '../../../models/chat.class';
import { ChatService } from '../../services/chat.service';

@Component({
  selector: 'app-pm-list',
  templateUrl: './pm-list.component.html',
  styleUrls: ['./pm-list.component.scss'],
})
export class PmListComponent implements OnInit, OnDestroy {

  firestore: Firestore = inject(Firestore);
  storedUserAuthUID: any;
  user: User = new User();

  // Aktive Chats filtern & sortieren
  unsubChats!: () => void;
  listChats: any = [];
  activeChats: any = [];

  // Aktive User filtern & sortieren
  unsubUsers!: () => void;
  listUsers: any = [];
  activeUsers: any = [];

  constructor(public chatService: ChatService) {}

  ngOnInit() {
    this.storedUserAuthUID = sessionStorage.getItem('userAuthUID');
    this.subChatList();
    this.getUser();
    this.filterActiveUsers(); // Fügen Sie dies hier hinzu, um die aktiven Benutzer zu initialisieren
  }

  ngOnDestroy(): void {
    this.unsubChats();
    this.unsubUsers();
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
        this.filterActiveChats();
      });
    });
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

  getUsersRef() {
    return collection(this.firestore, 'users');
  }

  subChatList() {
    const q = query(this.getChatsRef());
    this.unsubChats = onSnapshot(q, (list) => {
      this.listChats = [];
      list.forEach(element => {
        this.listChats.push(this.setChat(element.data(), element.id));
      });
      this.filterActiveChats();
    });
  }

  setChat(obj: any, id: string): Chat {
    return {
      id: id || "",
      chatId: obj.chatId || "",
      description: obj.description || "",
      creator: obj.creator || "",
      users: obj.users || [],
      posts: obj.posts || [],
      participants: obj.participants || [],
      messages: obj.messages || [],
      chatStartedBy: new User(obj.chatStartedBy || {}),
      date: obj.date || "",
      time: obj.time || ""
    };
  }

  getChatsRef(): import("@firebase/firestore-types").Query<unknown, import("@firebase/firestore").DocumentData> {
    return query(collection(this.firestore, 'chats')) as unknown as import("@firebase/firestore-types").Query<unknown, import("@firebase/firestore").DocumentData>;
  }


  filterActiveChats() {
    this.activeChats = this.listChats.filter((chat: any) => {
      
      // Überprüfen, ob der aktuelle Benutzer der Ersteller des Chats ist
      if (chat.chatStartedBy.authUID === this.user.authUID) {
        return true;
      }
  
      // Überprüfen, ob der aktuelle Benutzer unter den Teilnehmern ist
      const participantFound = chat.participants.some((participant: any) => participant.authUID === this.user.authUID);
      return participantFound;
    });
  }

// Hier müssen die aktiven Benutzer aus den bereits gestarteten Chats gefiltert werden
async filterActiveUsers() {
  const usersSnapshot = await getDocs(collection(this.firestore, 'users'));
  this.listUsers = usersSnapshot.docs.map(doc => this.setUserObject(doc.data()));

  // Filter die Benutzer, die bereits in den aktiven Chats sind
  this.activeUsers = this.listUsers.filter((user: any) => {
    // Überprüfen, ob der Benutzer im activeChats Array vorhanden ist
    const userInActiveChats = this.activeChats.some((chat: any) => {
      return chat.chatStartedBy.authUID === user.authUID ||
             chat.participants.some((participant: any) => participant.authUID === user.authUID);
    });

    // Hinzufügen des Benutzers zu activeUsers, wenn er nicht in activeChats ist
    return user.status === true && !userInActiveChats;
  });
}

createNewChat(user: any) {
console.log('Create new chat with user:', user);
}

}
