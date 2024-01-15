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
    //get time
    //get user
    //this.newPost.channel = channel;
    this.newPost.date = '15.01.2024';
    this.newPost.time = '11:45';
    //this.newPost.user = new User();
    console.log(this.newPost);
    updateDoc(this.getChannelDocRef(channel.id), { posts: arrayUnion(this.setPostObject(this.newPost, '')) })


  }


  setPostObject(obj: any, id: string,): Post {
    return {
      id: id || "",
      content: obj.content || "",
      channel: obj.channel || "",
      user: this.setUserObject(obj.user),
      date: obj.date || "",
      time: obj.time || "",
      answers: obj.answers || [],
      reactions: obj.reactions || [],
    }
  }



  setUserObject(obj: any) {
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









