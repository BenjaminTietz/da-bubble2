import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Channel } from '../../../../models/channel.class';
import { query, orderBy, limit, where, Firestore, collection, doc, getDoc, onSnapshot, addDoc, updateDoc, deleteDoc, setDoc, DocumentData, DocumentSnapshot, arrayUnion, FieldValue, Unsubscribe } from '@angular/fire/firestore';
import { User } from '../../../../models/user.class';



@Component({
  selector: 'app-add-user-to-channel',
  templateUrl: './add-user-to-channel.component.html',
  styleUrl: './add-user-to-channel.component.scss'
})
export class AddUserToChannelComponent implements OnDestroy, OnInit {

  firestore: Firestore = inject(Firestore);
  searchInput: string = '';
  dataLoaded: boolean = false;


  channel!: Channel;
  unsubUsers;
  listUsers: any = [];
  unsubUserChannel!: Unsubscribe;
  listUsersChannel: any = [];



  constructor() {
    this.unsubUsers = this.subUsersList();
  }


  ngOnInit(): void {
    this.unsubUserChannel = this.subUsersChannelList();

  }

  //Code für User im Channel

  subUsersChannelList() {
    const q = query(this.getUsersChannelRef(this.channel.id));
    return onSnapshot(q, (list) => {
      this.listUsersChannel = [];
      list.forEach(element => {
        this.listUsersChannel.push(this.setUser(element.data(), element.id));
      });

    });
  }

  getUsersChannelRef(chan_id: any) {
    return collection(this.firestore, 'channels', chan_id, 'users');
  }



  //Code für alle User

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


  searchFunction(user: any) {
    if (user.name.toLowerCase().includes(this.searchInput.toLowerCase())
      && !this.listUsersChannel.some((channelUser: any) => channelUser.id === user.id)
    ) {
      return true;
    } else {
      return false;
    }
  }


  selectUser(user: any) {
    setDoc(this.getUserInChannelSubcollectionRef(this.channel.id, user), this.setUserForSubcollectionInChannel(user)).then(() => {
      updateDoc(this.getUserDocRef(user), { channels: arrayUnion(this.channel.id) })
    })
  }


  getUserDocRef(user: any) {
    return doc(this.firestore, 'users', user.id)
  }


  setUserForSubcollectionInChannel(obj: any) {
    return {
      id: obj.id || "",
      authUID: obj.authUID || "",
    }
  }


  getUserInChannelSubcollectionRef(chan_id: any, user: any) {
    return doc(this.firestore, 'channels', chan_id, 'users', user.id)
  }


  ngOnDestroy(): void {
    this.unsubUsers();
    //this.unsubUserChannel();
  }



}
