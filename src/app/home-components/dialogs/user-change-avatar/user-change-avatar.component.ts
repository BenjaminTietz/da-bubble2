import { Component } from '@angular/core';
import { User } from '../../../../models/user.class';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-user-change-avatar',
  templateUrl: './user-change-avatar.component.html',
  styleUrl: './user-change-avatar.component.scss'
})
export class UserChangeAvatarComponent {

  user!: User;

  //Liste mit Dateinamen der Bilder...bei Bedarf ergänzen
  listImages = ['character_1.png', 'character_2.png', 'character_3.png', 'character_4.png', 'character_5.png', 'character_6.png']



  constructor(public dialogRef: MatDialogRef<UserChangeAvatarComponent>) { }


  selectAvatar(url: any) {
    this.user.avatarURL = `../../../assets/img/${url}`

  }


  saveAvatar(url: any) {
    this.selectAvatar(url);
    this.dialogRef.close(this.user.avatarURL);
  }







}
