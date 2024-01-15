import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { query, orderBy, limit, where, Firestore, collection, doc, getDoc, onSnapshot, addDoc, updateDoc, deleteDoc, setDoc, DocumentData, DocumentSnapshot, arrayUnion, FieldValue } from '@angular/fire/firestore';
import { Channel } from '../../../models/channel.class';
import { MatDialog } from '@angular/material/dialog';
import { Post } from '../../../models/post.class';
import { User } from '../../../models/user.class';





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



  newPost: Post = new Post();

  constructor(private route: ActivatedRoute, public dialog: MatDialog) {
  };



  //Code für Channels

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.channelID = params['id'];
      // Rufen Sie hier Ihre Funktion auf, um Daten basierend auf dem neuen channelId zu laden
      this.loadChannelData(this.channelID);
    });

    const storedUserAuthUID = sessionStorage.getItem('userAuthUID');

    console.log(storedUserAuthUID);

  }

  loadChannelData(id: string) {
    this.unsubChannel = onSnapshot(doc(this.firestore, 'channels', this.channelID), (doc) => {
      this.channel = new Channel(doc.data())
      this.dataLoaded = true;
    });
  }




  //Code für Posts

  createPost(channel: any) {
    console.log('Create Post')
    //get user

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
      answers: obj.answers || [],
      reactions: obj.reactions || [],
    }
  }


  setUserObject(obj: any) { //Daten müssen noch vom aktuellen User ausgelesen werden!
    return {
      id: obj.id || "",
      authUID: obj.authUID || "",
      name: obj.name || "",
      status: obj.status || true,
      photoURL: '../../../assets/img/character_1.png',
      channels: obj.channels || [],
    }
  }


  getChannelDocRef(chan_id: any) {
    return doc(this.firestore, 'channels', chan_id);
  }







  ngOnDestroy(): void {
    this.unsubChannel();
  }



}









