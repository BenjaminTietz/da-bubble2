import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { query, orderBy, limit, where, Firestore, collection, doc, getDoc, onSnapshot, addDoc, updateDoc, deleteDoc, setDoc, DocumentData, DocumentSnapshot, arrayUnion, FieldValue } from '@angular/fire/firestore';
import { Channel } from '../../../models/channel.class';
import { MatDialog } from '@angular/material/dialog';
import { Post } from '../../../models/post.class';
import { User } from '../../../models/user.class';
import { getDocs } from 'firebase/firestore';





@Component({
  selector: 'app-channels',
  templateUrl: './channels.component.html',
  styleUrl: './channels.component.scss'
})
export class ChannelsComponent implements OnDestroy, OnInit {
  firestore: Firestore = inject(Firestore);
  activatedRoute = inject(ActivatedRoute);
  routeId: any;
  channelID: any;
  channelData: any;
  channel!: Channel;
  dataLoaded: boolean = false;

  unsubChannel!: () => void;

  unsubPosts!: () => void;


  user: User = new User();
  storedUserAuthUID: any;

  newPost: Post = new Post();

  postDetail: number = 4; //prüfen auf welche Nummer initial setzen
  showAnswers: boolean = false;


  constructor(private route: ActivatedRoute, public dialog: MatDialog) {
  };



  //Code für Channels

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.channelID = params['id'];
      this.loadChannelData(this.channelID);
    });

    this.storedUserAuthUID = sessionStorage.getItem('userAuthUID');
    this.getUser();

  }


  getUser() {
    let q;
    if (this.storedUserAuthUID) {
      q = query(this.getUsersRef(), where("authUID", "==", this.storedUserAuthUID));
    } else {
      q = query(this.getUsersRef(), where("authUID", "==", this.storedUserAuthUID)); // q = input für Gastzugang
    }

    return onSnapshot(q, (docSnap: any) => {
      docSnap.forEach((doc: any) => {
        this.user = new User(this.setUserObject(doc.data()))
      })
    })

  }


  getUsersRef() {
    return collection(this.firestore, 'users');
  }


  loadChannelData(id: string) {
    this.unsubChannel = onSnapshot(doc(this.firestore, 'channels', this.channelID), (doc) => {
      this.channel = new Channel(doc.data())
      this.dataLoaded = true;
    });
  }




  //Code für Posts

  createPost(channel: any) {
    this.newPost.user = this.user;
    this.newPost.channelId = channel.id;
    this.newPost.date = this.getCurrentDate();
    this.newPost.time = this.getCurrentTime();

    updateDoc(this.getChannelDocRef(channel.id), { posts: arrayUnion(this.setPostObject(this.newPost, '')) }).then(() => {
      this.newPost.content = '';

    });

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


  setPostObject(obj: any, id: string,): Post {
    return {
      id: id || "",
      content: obj.content || "",
      channelId: obj.channelId || "",
      user: this.setUserObject(obj.user),
      date: obj.date || "",
      time: obj.time || "",
      answers: obj.answers ? obj.answers.map((answer: any) => this.setAnswerObject(answer)) : [],
      reactions: obj.reactions || [],
    }
  }


  setUserObject(obj: any) {
    return {
      id: obj.id || "",
      authUID: obj.authUID || "",
      name: obj.name || "",
      status: obj.status || true,
      avatarURL: obj.avatarURL || '', //code added by Ben
      photoURL: obj.photoURL || '',
      channels: obj.channels || [],
      email: obj.email || ''
    }
  }



  setAnswerObject(obj: any) {
    return {
      id: obj.id || "",
      content: obj.content || "",
      user: obj.user || "",
      post: obj.post || "",
      date: obj.date || "",
      time: obj.time || "",
      reactions: obj.reactions || "", // noch set reactions?
    }

  }




  //Code für Answers






  hideAnswers() {
    this.showAnswers = false;
    this.postDetail = -1; //prüfen auf welche nummer setzen
  }







  getChannelDocRef(chan_id: any) {
    return doc(this.firestore, 'channels', chan_id);
  }







  ngOnDestroy(): void {
    this.unsubChannel();
  }



}









