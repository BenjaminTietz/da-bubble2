import { Component, OnDestroy, inject } from '@angular/core';
import { Channel } from '../../../../models/channel.class';
import { query, orderBy, limit, where, Firestore, collection, doc, getDoc, onSnapshot, addDoc, updateDoc, deleteDoc, setDoc, DocumentData, DocumentSnapshot, arrayUnion, FieldValue } from '@angular/fire/firestore';
import { User } from '../../../../models/user.class';



@Component({
  selector: 'app-add-user-to-channel',
  templateUrl: './add-user-to-channel.component.html',
  styleUrl: './add-user-to-channel.component.scss'
})
export class AddUserToChannelComponent implements OnDestroy {

  firestore: Firestore = inject(Firestore);
  searchInput: string = '';
  dataLoaded: boolean = false;


  channel!: Channel;
  unsubUsers;
  listUsers: any = [];



  constructor() {
    this.unsubUsers = this.subUsersList();
  }

  subUsersList() {
    const q = query(this.getUsersRef());
    return onSnapshot(q, (list) => {
      this.listUsers = [];
      list.forEach(element => {
        this.listUsers.push(this.setUser(element.data(), element.id));
      });
      this.dataLoaded = true;
    });
  }


  setUser(obj: any, id: string,): User {
    return {
      id: id || "",
      authUID: obj.authUID || "",
      name: obj.name || "",
      status: obj.status || false,
      avatarURL: obj.avatarURL || "",
      photoURL: obj.photoURL || "",
      channels: obj.channels || [],
      email: obj.email || []
    }
  }


  getUsersRef() {
    return collection(this.firestore, 'users');
  }


  searchUser() {
    console.log('search for: ', this.searchInput);

  }


  searchFunction(user: any) {
    if (user.name.toLowerCase().includes(this.searchInput.toLowerCase())
    ) {
      return true;
    } else {
      return false;
    }
  }


  selectUser(user: any) {
    console.log('select user ', user)
  }







  ngOnDestroy(): void {
    this.unsubUsers();
  }



}
