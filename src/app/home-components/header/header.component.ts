import { Component, OnInit, inject } from '@angular/core';
import { User } from '../../../models/user.class';
import { query, orderBy, limit, where, Firestore, collection, doc, getDoc, onSnapshot, addDoc, updateDoc, deleteDoc, setDoc, DocumentData, DocumentSnapshot, arrayUnion, FieldValue } from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';
import { UserDetailComponent } from '../dialogs/user-detail/user-detail.component';
import { AuthService } from '../../services/auth.service';
import { SearchService } from '../../services/search.service';
import { UserService } from '../../services/user.service';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {

  firestore: Firestore = inject(Firestore);
  userService: UserService = inject(UserService);


  //user: User = new User();
  user: User | null = null;

  storedUserAuthUID: any;


  constructor(
    public dialog: MatDialog,
    private AuthService: AuthService,
    public searchService: SearchService
  ) {

  }


  ngOnInit(): void {
    this.storedUserAuthUID = sessionStorage.getItem('userAuthUID');
    this.getUserWithService();
  }


  async getUserWithService() {
    this.user = await this.userService.getUser()
  }


  openDialogProfile(): void {
    const dialog = this.dialog.open(UserDetailComponent, {
      position: {
        top: '32px',
        right: '32px'
      },
      maxWidth: '100%',
      panelClass: 'dialog-profile-detail'

    });
    dialog.componentInstance.user = new User(this.user);
  }

  logout() {
    this.AuthService.logout();
  }




}
