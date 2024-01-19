import { Component, OnInit } from '@angular/core';
import { getFirestore, Firestore, collection, query, where, getDocs, CollectionReference, DocumentData, addDoc, doc, DocumentReference } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { Router } from '@angular/router';
import { onChildMoved } from 'firebase/database';
import { Chat } from '../../../models/chat.class';
import { User } from '../../../models/user.class';
import { updateDoc } from 'firebase/firestore';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Message } from '../../../models/message.class';
import { MessageAnswer } from '../../../models/messageAnswer.class';
import { ChatService } from '../../services/chat.service';



@Component({
  selector: 'app-private-messages',
  templateUrl: './private-messages.component.html',
  styleUrl: './private-messages.component.scss'
})
export class PrivateMessagesComponent implements OnInit {

  chatId: any;
selectedItemId: any|string;
selectedUsers: User[] = []; // Hier die Initialisierung entsprechend deinem Code
chatData: any; // Variable zum Speichern der Chat-Daten


  constructor(private route: ActivatedRoute, public dialog: MatDialog, private chatService: ChatService) {
  };


  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.chatId = params['id'];
      this.loadChatData();
      //this.unsubPosts = this.subPostsList(this.channelID);
    });
  }

  async loadChatData() {
    try {
      // Lade die Chat-Daten mit der Chat-ID
      this.chatData = await this.chatService.getChatDataById(this.chatId);

      // Überprüfe, ob Chat-Daten vorhanden sind
      if (this.chatData) {
        // Füge die Teilnehmer dem ausgewählten Benutzer-Array hinzu
        this.selectedUsers = this.chatData.participants;
      } else {
        console.error('Chat-Daten nicht gefunden.');
      }
    } catch (error) {
      console.error('Fehler beim Laden der Chat-Daten:', error);
    }
  }
  getParticipantInfo(participant: User): string {
    // Hier kannst du die Informationen formatieren, wie du möchtest
    return `${participant.name} (${participant.email})`;
  }
}

