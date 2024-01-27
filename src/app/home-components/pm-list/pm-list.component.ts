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
  doc,
  getDoc,
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

  userData: User = new User();
  chatsData: any = [];
  activeChats: any = [];
  activeUsers: any = [];
  unsubChats!: () => void;
  listUsers: any = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private chatService: ChatService) 
  {}

  ngOnInit() {
    this.storedUserAuthUID = sessionStorage.getItem('userAuthUID');
    this.subChatList();
    this.getUser();
    this.filterActiveUsers();
  }

  ngOnDestroy(): void {
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
      );
    }

    return onSnapshot(q, (docSnap: any) => {
      docSnap.forEach((doc: any) => {
        this.userData = new User(this.setUserObject(doc.data()));
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

  subChatList() {
    const q = query(this.getChatsRef());
    this.unsubChats = onSnapshot(q, (list) => {
      this.chatsData = [];
      list.forEach((element) => {
        this.chatsData.push(this.setChat(element.data(), element.id));
      });
      this.filterActiveChats();
    });
  }

  //hier fehlt eine Logik zum filtern, dass man entweder den Chat begonnen hat und den Teilnehmer angezeigt bekommt oder dass man Teilnehmer ist und denjenigen angezeigt bekommt der den Chat gestartet hat
  filterActiveChats() {
    this.activeChats = this.chatsData.filter((chat: any) => {
      const isChatStartedByCurrentUser = chat.chatStartedBy.authUID === this.userData.authUID;
      const isCurrentUserParticipant = Array.isArray(chat.participants) &&
        chat.participants.some((participant: any) => participant.authUID === this.userData.authUID);
  
      // Setze den Status für den Initiator des Chats (chatStartedBy)
      if (isChatStartedByCurrentUser) {
        chat.chatStartedBy.status = this.userData.status;
      }
  
      // Setze den Status für jeden Teilnehmer des Chats
      if (Array.isArray(chat.participants)) {
        chat.participants.forEach((participant: any) => {
          if (participant.authUID === this.userData.authUID) {
            participant.status = this.userData.status;
          }
        });
      }
  
      return isChatStartedByCurrentUser || isCurrentUserParticipant;
    });
  
    this.filterActiveUsers();
  }

  // Hier müssen die aktiven Benutzer aus den bereits gestarteten Chats gefiltert werden
  async filterActiveUsers() {
    const usersSnapshot = await getDocs(collection(this.firestore, 'users'));
    this.listUsers = usersSnapshot.docs.map((doc) =>
      this.setUserObject(doc.data())
    );
  
    // Filter users who are either participants or have started a chat
    this.activeUsers = this.listUsers.filter((user: any) => {
      // Check if the user is a participant or has started a chat in activeChats
      const userInActiveChats = this.activeChats.some((chat: any) => {
        return (
          chat.chatStartedBy.authUID === user.authUID ||
          (Array.isArray(chat.participants) &&
            chat.participants.some(
              (participant: any) => participant.authUID === user.authUID
            ))
        );
      });
  
      // Include the user in activeUsers if they are not in activeChats and not the current user
      return user.status === true && !userInActiveChats && user.authUID !== this.userData.authUID;
    });
  
    // Fetch online status for each user
    await this.fetchOnlineStatusForUsers();
  }
  
  async fetchOnlineStatusForUsers() {
    for (const user of this.activeUsers) {
      const userDocRef = doc(collection(this.firestore, 'users'), user.id);
      const userDocSnap = await getDoc(userDocRef);
  
      if (userDocSnap.exists()) {
        user.status = userDocSnap.data()['status'];
      }
    }
  }
  

  isUserParticipant(chat: any): boolean {
    return chat.participants.some((participant: any) => participant.authUID === this.storedUserAuthUID);
  }
  

async createNewChat(participant: any) {
  console.log('Create new chat with user:', participant);

  try {
    // Create a new chat document
    const chatDocRef = await addDoc(collection(this.firestore, 'chats'), {
      chatStartedBy: {
        id: this.userData.id,
        name: this.userData.name,
        photoURL: this.userData.photoURL,
        authUID: this.userData.authUID,
        status: this.userData.status,
        avatarURL: this.userData.avatarURL,
        channels: [],
        email: this.userData.email,
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
