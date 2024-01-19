import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';



@Component({
  selector: 'app-private-messages',
  templateUrl: './private-messages.component.html',
  styleUrl: './private-messages.component.scss'
})
export class PrivateMessagesComponent implements OnInit {

  chatId: any;



  constructor(private route: ActivatedRoute, public dialog: MatDialog) {
  };


  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.chatId = params['id'];
      //this.loadChannelData(this.channelID);
      //this.unsubPosts = this.subPostsList(this.channelID);
    });






  






  }
}
