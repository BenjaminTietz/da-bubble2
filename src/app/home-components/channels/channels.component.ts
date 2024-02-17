import { AfterContentInit, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { query, orderBy, limit, where, Firestore, collection, doc, getDoc, onSnapshot, addDoc, updateDoc, deleteDoc, setDoc, DocumentData, DocumentSnapshot, arrayUnion, FieldValue } from '@angular/fire/firestore';
import { Channel } from '../../../models/channel.class';
import { MatDialog } from '@angular/material/dialog';
import { Post } from '../../../models/post.class';
import { User } from '../../../models/user.class';
import { getDocs } from 'firebase/firestore';
import { Answer } from '../../../models/answer.class';
import { AddUserToChannelComponent } from '../dialogs/add-user-to-channel/add-user-to-channel.component';
import { DeleteAnswerComponent } from '../dialogs/delete-answer/delete-answer.component';
import { DeletePostComponent } from '../dialogs/delete-post/delete-post.component';
import { UserListChannelComponent } from '../user-list-channel/user-list-channel.component';
import { ChannelDetailComponent } from '../dialogs/channel-detail/channel-detail.component';
import { UserService } from '../../services/user.service';





@Component({
  selector: 'app-channels',
  templateUrl: './channels.component.html',
  styleUrl: './channels.component.scss'
})
export class ChannelsComponent implements OnDestroy, OnInit {
  firestore: Firestore = inject(Firestore);
  userService: UserService = inject(UserService);

  activatedRoute = inject(ActivatedRoute);
  routeId: any;
  channelID: any;
  channelData: any;
  channel!: Channel;
  dataLoaded: boolean = false;

  unsubChannel!: () => void;

  unsubPosts!: () => void;
  listPosts: any = [];

  unsubAnswers!: () => void;
  listAnswers: any = [];

  unsubUsersChannel!: () => void;
  listUsersInChannel: any = [];

  unsubUsers!: () => void;
  listUsers: any = [];
  user: User | null = null;

  unsubReactionsPost!: () => void;
  listReactionsPost: any = [];


  unsubReactionsAnswer!: () => void;
  listReactionsAnswer: any = [];



  storedUserAuthUID: any;

  newPost: Post = new Post();

  postDetail: number = 0; //prüfen auf welche Nummer initial setzen
  showAnswers: boolean = false;
  newAnswer: Answer = new Answer();


  constructor(private route: ActivatedRoute, public dialog: MatDialog) {
  };

  //Code für Reactions

  reactPost(chan_id: any, post: any, i: any) {
    console.log(chan_id)
    console.log(post)
    console.log(i)





  }





  addReactionPost(chan_id: any, post: any, i: any, reaction: any) {
    console.log(chan_id)
    console.log(post)
    console.log(i)
    console.log(reaction)
    console.log(reaction.emoji)
  }









  //Code für Users

  subUsersList() {
    const q = query(this.getUsersRef());
    return onSnapshot(q, (list) => {
      this.listUsers = [];
      list.forEach(element => {
        this.listUsers.push(this.setUser(element.data(), element.id));
      });
      //this.dataLoaded = true;
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



  //Code für Channels

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.channelID = params['id'];
      this.loadChannelData(this.channelID);
      this.unsubPosts = this.subPostsList(this.channelID);
      this.unsubUsers = this.subUsersList();
      this.unsubUsersChannel = this.subUsersChannelList(this.channelID);
      this.showAnswers = false;
    });

    this.storedUserAuthUID = sessionStorage.getItem('userAuthUID');
    this.getUserWithService();
  }


  subUsersChannelList(chan_id: any) {
    const q = query(this.getUsersChannelSubcollectionRef(chan_id), orderBy('authUID'));
    return onSnapshot(q, (list) => {
      this.listUsersInChannel = [];
      list.forEach(element => {
        let user = this.listUsers.find((user: any) => user.authUID === element.data()['authUID'])
        this.listUsersInChannel.push(user);
      });
    });
  }


  getUsersChannelSubcollectionRef(chan_id: any) {
    return collection(this.firestore, 'channels', chan_id, 'users')
  }


  subPostsList(chan_id: any) {
    const q = query(this.getPostSubcollectionRef(chan_id), where('channelId', '==', chan_id), orderBy('date'));
    return onSnapshot(q, (list) => {
      this.listPosts = [];
      list.forEach(element => {
        this.listPosts.push(this.setPostObject(element.data(), element.id));
      });
    });
  }


  async getUserWithService() {
    this.user = await this.userService.getUser()
  }


  getUsersRef() {
    return collection(this.firestore, 'users');
  }


  loadChannelData(id: string) {
    this.unsubChannel = onSnapshot(doc(this.firestore, 'channels', id), (doc) => {
      this.channel = new Channel(doc.data())
      this.dataLoaded = true;
    });
  }


  //Code für Posts


  createPost(channel: any) {
    this.newPost.user = this.user ? this.user : new User();
    this.newPost.channelId = channel.id;
    this.newPost.date = new Date().toISOString();

    addDoc(this.getPostSubcollectionRef(channel.id), this.setPostObject(this.newPost, '')).then((docRef) => {
      this.newPost.content = '';
      const newID = docRef?.id;
      this.updatePostWithId(channel, newID, channel.id);
      this.ngOnInit();
    })
  }


  async updatePostWithId(item: Post, newId: any, chan_id: any) {
    const docRef = doc(this.getPostSubcollectionRef(chan_id), newId);
    await updateDoc(docRef, { id: newId }).catch(
      (err) => { console.log(err); }
    ).then(
      () => { }
    );
  }


  async updatePostAmountAnswers(post_id: any, amount: any, chan_id: any) {

    const dateLastAnswer = this.getLastAnswerDate();

    const docRef = doc(this.getPostSubcollectionRef(chan_id), post_id);
    await updateDoc(docRef, {
      answers: amount,
      lastAnswer: dateLastAnswer
    }).catch(
      (err) => { console.log(err); }
    ).then(
      () => { }
    );
  }


  getLastAnswerDate() {
    if (this.listAnswers.length === 0) {
      return null; // oder ein sinnvoller Standardwert
    }

    const latestDate = this.listAnswers.reduce((latest: any, current: any) => {
      return latest.date > current.date ? latest : current;
    }).date;

    return latestDate;
  }







  getPostSubcollectionRef(chan_id: any) {
    return collection(this.firestore, 'channels', chan_id, 'posts')
  }


  //Ende Code für Post als Subcollection



  setPostObject(obj: any, id: string,): Post {
    return {
      id: id || "",
      content: obj.content || "",
      channelId: obj.channelId || "",
      user: this.setUserObject(obj.user),
      date: obj.date || "",
      lastAnswer: obj.lastAnswer || "",
      answers: obj.answers ? obj.answers : 0,
      reactions: obj.reactions || [],
    }
  }


  setUserObject(obj: any) {
    return {
      id: obj.id || "",
      authUID: obj.authUID || "",
      name: obj.name || "",
      status: obj.status || true,
      avatarURL: obj.avatarURL || '', //code added by Ben
      photoURL: obj.photoURL || '',
      channels: obj.channels || [],
      email: obj.email || ''
    }
  }



  setAnswerObject(obj: any) {
    return {
      id: obj.id || "",
      content: obj.content || "",
      user: this.setUserObject(obj.user),
      postId: obj.postId || "",
      date: obj.date || "",
      time: obj.time || "",
      reactions: obj.reactions || "", // noch set reactions?
    }

  }




  //Code für Answers

  createAnswer(chan_id: any, post: any) {
    if (this.newAnswer.content) {
      this.newAnswer.user = this.user ? this.user : new User();
      this.newAnswer.date = new Date().toISOString();
      this.newAnswer.postId = post.id;

      addDoc(this.getAnswerSubcollectionRef(chan_id, post.id), this.setAnswerObject(this.newAnswer)).then((docRef) => {
        this.newAnswer.content = '';
        const newID = docRef?.id;
        this.updatePostAmountAnswers(post.id, this.listAnswers.length, chan_id)
        this.updateAnswerWithId(post.id, newID, chan_id)
      })
    }
  }


  async updateAnswerWithId(post_id: any, newId: any, chan_id: any) {
    const docRef = doc(this.getAnswerSubcollectionRef(chan_id, post_id), newId);
    await updateDoc(docRef, { id: newId }).catch(
      (err) => { console.log(err); }
    ).then(
      () => { }
    );
  }






  getPostDocRef(chan_id: any, post_id: any) {
    return doc(this.firestore, "channels", chan_id, "posts", post_id);
  }


  openAnswers(chan_id: any, post: any, i: any) {
    this.showAnswers = true;
    this.postDetail = i;
    this.unsubAnswers = this.subAnswersList(chan_id, post.id);
  }


  subAnswersList(chan_id: any, post_id: any) {
    const q = query(this.getAnswerSubcollectionRef(chan_id, post_id), where('postId', '==', post_id), orderBy('date'));
    return onSnapshot(q, (list) => {
      this.listAnswers = [];
      list.forEach(element => {
        this.listAnswers.push(this.setAnswerObject(element.data()));
      });
    });
  }


  deleteAnswer(answer: any) {
    const dialog = this.dialog.open(DeleteAnswerComponent);
    dialog.componentInstance.answer = new Answer(answer);
    dialog.componentInstance.chan_id = this.channel.id;

    dialog.afterClosed().subscribe(result => {
      this.updatePostAmountAnswers(answer.postId, this.listAnswers.length, this.channel.id)
    })

  }




  getAnswerSubcollectionRef(chan_id: any, post_id: any) {
    return collection(this.firestore, 'channels', chan_id, 'posts', post_id, 'answers')
  }



  hideAnswers() {
    this.showAnswers = false;
    this.postDetail = 0; //prüfen auf welche nummer setzen
  }



  //Post löschen

  openDialogDeletePost(post: any) {
    const dialog = this.dialog.open(DeletePostComponent);
    dialog.componentInstance.post = new Post(post);
    dialog.componentInstance.chan_id = this.channel.id;

    dialog.afterClosed().subscribe(result => {
      //console.log(result)
    })

  }


  //Code für add user to channel

  openDialogAddUserToChannel(channel: any) {
    const dialog = this.dialog.open(AddUserToChannelComponent);
    dialog.componentInstance.channel = new Channel(channel);

  }


  //code für show user list channel


  openDialogShowUsers(channel: any) {
    const dialog = this.dialog.open(UserListChannelComponent);
    dialog.componentInstance.channel = new Channel(channel);
    dialog.componentInstance.listUsersInChannel = this.listUsersInChannel;



  }



  //code für channel-detail


  openDialogChannelDetail(channel: any, user: any) {
    const dialog = this.dialog.open(ChannelDetailComponent);
    dialog.componentInstance.channel = new Channel(channel);
    dialog.componentInstance.user = new User(user);


  }





  //Verschiedenes:

  getChannelDocRef(chan_id: any) {
    return doc(this.firestore, 'channels', chan_id);
  }


  ngOnDestroy(): void {
    this.unsubChannel();
    this.unsubPosts();
    //this.unsubAnswers();
  }



}









