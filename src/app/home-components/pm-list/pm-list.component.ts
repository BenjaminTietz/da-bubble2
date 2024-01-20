import { Component, HostListener, inject, OnDestroy, OnInit } from '@angular/core';
import { query, orderBy, limit, where, Firestore, collection, doc, onSnapshot, addDoc, updateDoc, deleteDoc, setDoc } from '@angular/fire/firestore';
import { Channel } from '../../../models/channel.class';



import { ChatService } from '../../services/chat.service';
import { Chat } from '../../../models/chat.class';
import { User } from '../../../models/user.class';

@Component({
  selector: 'app-pm-list',
  templateUrl: './pm-list.component.html',
  styleUrls: ['./pm-list.component.scss'],
})
export class PmListComponent implements OnInit {

  listChats: any = [];
  chat = new Chat();

  constructor(public chatService: ChatService) {}

  ngOnInit() {
    this.chatService.loadChats();
    console.log('Chat-Liste:', this.chatService.chats);
  }

  subChatList() {
    const q = query(this.getChannelsRef());
    return onSnapshot(q, (list) => {
      this.listChats = [];
      list.forEach(element => {
        this.listChats.push(this.setChat(element.data(), element.id));
      });
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
      participants: [],
      messages: [],
      chatStartedBy: new User(), // Replace "" with an instance of the User class
      date: "",
      time: ""
    };
  }

  getChannelsRef(): import("@firebase/firestore-types").Query<unknown, import("@firebase/firestore").DocumentData> {
    throw new Error('Method not implemented.');
  }

}
