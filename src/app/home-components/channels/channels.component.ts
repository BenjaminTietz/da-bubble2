import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { query, orderBy, limit, where, Firestore, collection, doc, getDoc, onSnapshot, addDoc, updateDoc, deleteDoc, setDoc, DocumentData, DocumentSnapshot } from '@angular/fire/firestore';
import { Channel } from '../../../models/channel.class';
import { MatDialog } from '@angular/material/dialog';





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

  constructor(private route: ActivatedRoute, public dialog: MatDialog) {
  };


  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.channelID = params['id'];
      // Rufen Sie hier Ihre Funktion auf, um Daten basierend auf dem neuen channelId zu laden
      this.loadChannelData(this.channelID);
    });
  }

  async loadChannelData(id: string) {
    this.unsubChannel = onSnapshot(doc(this.firestore, 'channels', this.channelID), (doc) => {
      this.channel = new Channel(doc.data())
      this.dataLoaded = true;
    });
    


  }



  ngOnDestroy(): void {
    this.unsubChannel();
  }


}

