import { Component } from '@angular/core';
import { User } from '../../../../models/user.class';
import { MatDialog } from '@angular/material/dialog';
import { UserEditComponent } from '../user-edit/user-edit.component';

@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrl: './user-detail.component.scss'
})
export class UserDetailComponent {

  user!: User;


  constructor(public dialog: MatDialog) {

  }



  openDialogEditUser(user: any) {
    const dialog = this.dialog.open(UserEditComponent, {
      position: {
        top: '32px',
        right: '32px'
      },
      maxWidth: '100%',
      panelClass: 'dialog-profile-detail'

    });
    dialog.componentInstance.user = new User(this.user);
    dialog.afterClosed().subscribe(result => {
      if (result) {
        this.user = result;
      }
    })



  }






}
