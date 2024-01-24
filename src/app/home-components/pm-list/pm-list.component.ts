import {
  Component,
  HostListener,
  inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {
  Firestore,
  collection,
  query,
  onSnapshot,
  where,
  getDocs,
  addDoc,
} from '@angular/fire/firestore';
import { User } from '../../../models/user.class';
import { Chat } from '../../../models/chat.class';
import { ChatService } from '../../services/chat.service';
import { ActivatedRoute, Router } from '@angular/router';

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


  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private chatService: ChatService) 
  {}

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
      list.forEach((element) => {
        this.listChats.push(this.setChat(element.data(), element.id));
      });
      this.filterActiveChats();
    });
  }

  setChat(obj: any, id: string): Chat {
    return {
      id: id || '',
      chatId: obj.chatId || '',
      description: obj.description || '',
      creator: obj.creator || '',
      users: obj.users || [],
      posts: obj.posts || [],
      participants: obj.participants || [],
      messages: obj.messages || [],
      chatStartedBy: new User(obj.chatStartedBy || {}),
      date: obj.date || '',
      time: obj.time || '',
    };
  }

  getChatsRef(): import('@firebase/firestore-types').Query<
    unknown,
    import('@firebase/firestore').DocumentData
  > {
    return query(
      collection(this.firestore, 'chats')
    ) as unknown as import('@firebase/firestore-types').Query<
      unknown,
      import('@firebase/firestore').DocumentData
    >;
  }

  filterActiveChats() {
    this.activeChats = this.listChats.filter((chat: any) => {
      // Überprüfen, ob der aktuelle Benutzer der Ersteller des Chats ist
      if (chat.chatStartedBy.authUID === this.user.authUID) {
        return true;
      }

      // Überprüfen, ob der aktuelle Benutzer unter den Teilnehmern ist
      const participantFound =
        Array.isArray(chat.participants) &&
        chat.participants.some(
          (participant: any) => participant.authUID === this.user.authUID
        );
      return participantFound;
    });
  }

  // Hier müssen die aktiven Benutzer aus den bereits gestarteten Chats gefiltert werden
  async filterActiveUsers() {
    const usersSnapshot = await getDocs(collection(this.firestore, 'users'));
    this.listUsers = usersSnapshot.docs.map((doc) =>
      this.setUserObject(doc.data())
    );

    // Filtern Sie die Benutzer, die bereits in den aktiven Chats sind
    this.activeUsers = this.listUsers.filter((user: any) => {
      // Überprüfen, ob der Benutzer im activeChats Array vorhanden ist
      const userInActiveChats = this.activeChats.some((chat: any) => {
        return (
          chat.chatStartedBy.authUID === user.authUID ||
          (Array.isArray(chat.participants) &&
            chat.participants.some(
              (participant: any) => participant.authUID === user.authUID
            ))
        );
      });

      // Hinzufügen des Benutzers zu activeUsers, wenn er nicht in activeChats ist
      return user.status === true && !userInActiveChats;
    });
  }

  async createNewChat(participant: any) {
    console.log('Create new chat with user:', participant);
  
    try {
      // Create a new chat document
      const chatDocRef = await addDoc(collection(this.firestore, 'chats'), {
        chatStartedBy: {
          id: this.user.id,
          name: this.user.name,
          photoURL: this.user.photoURL,
          authUID: this.user.authUID,
          status: this.user.status,
          avatarURL: this.user.avatarURL,
          channels: [], 
          email: this.user.email,
        },
        participants: [participant], 
        messages: [], 
        date: this.getCurrentDate(),
        time: this.getCurrentTime(),
      });
  
      console.log(`Chat created and stored in the database. Chat ID: ${chatDocRef.id}`);
      this.router.navigate(['/home/private-messages', chatDocRef.id]);
    } catch (error) {
      console.error('Error creating and storing the chat:', error);
    }
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
}
