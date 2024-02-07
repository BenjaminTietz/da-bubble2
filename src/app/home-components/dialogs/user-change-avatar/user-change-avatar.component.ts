import { Component } from '@angular/core';
import { User } from '../../../../models/user.class';

@Component({
  selector: 'app-user-change-avatar',
  templateUrl: './user-change-avatar.component.html',
  styleUrl: './user-change-avatar.component.scss'
})
export class UserChangeAvatarComponent {

  user!: User;













  selectAvatar(url: any) {
    console.log(url)


  }



}
