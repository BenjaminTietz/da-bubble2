import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DialogAddChannelComponent } from '../dialogs/dialog-add-channel/dialog-add-channel.component';
import { ChatService } from '../../services/chat.service';
import { MatDrawer } from '@angular/material/sidenav';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  title = 'da-bubble';

  @ViewChild('drawer') drawer!: MatDrawer;
  isOpen!: boolean;

  public isScreenSmall!: boolean;
  drawerMode: 'side' | 'over' = 'side';
  drawerOpened: boolean = false;

  constructor(public dialog: MatDialog, public chatService: ChatService) {
    this.checkScreenSize();
  }

  ngOnInit(): void {
    //this.chatService.loadChats();  Board schmiert ab
  }

  private checkScreenSize() {
    this.isScreenSmall = window.innerWidth < 850;
    this.drawerMode = this.isScreenSmall ? 'over' : 'side';
    this.drawerOpened = !this.isScreenSmall;
  }


  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize();
  }



  noToggle(event: MouseEvent): void {
    event.stopImmediatePropagation();

  }

  openDialogAddChannel() {
    this.dialog.open(DialogAddChannelComponent)
  }




  changeDrawerStatus(opened: boolean) {
    this.isOpen = opened;
  }




}
