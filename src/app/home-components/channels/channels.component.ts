import { AfterContentInit, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { query, orderBy, limit, where, Firestore, collection, doc, getDoc, onSnapshot, addDoc, updateDoc, deleteDoc, setDoc, DocumentData, DocumentSnapshot, arrayUnion, FieldValue } from '@angular/fire/firestore';
import { Channel } from '../../../models/channel.class';
import { MatDialog } from '@angular/material/dialog';
import { Post } from '../../../models/post.class';
import { User } from '../../../models/user.class';
import { getDocs, runTransaction } from 'firebase/firestore';
import { Answer } from '../../../models/answer.class';
import { AddUserToChannelComponent } from '../dialogs/add-user-to-channel/add-user-to-channel.component';
import { DeleteAnswerComponent } from '../dialogs/delete-answer/delete-answer.component';
import { DeletePostComponent } from '../dialogs/delete-post/delete-post.component';
import { UserListChannelComponent } from '../user-list-channel/user-list-channel.component';
import { ChannelDetailComponent } from '../dialogs/channel-detail/channel-detail.component';
import { UserService } from '../../services/user.service';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { Reaction } from '../../../models/reaction.class';





@Component({
  selector: 'app-channels',
  templateUrl: './channels.component.html',
  styleUrl: './channels.component.scss'
})
export class ChannelsComponent implements OnDestroy, OnInit {
  firestore: Firestore = inject(Firestore);
  userService: UserService = inject(UserService);

  emojiPickerAnswerVisible: boolean = false;
  emojiPickerPostVisible: boolean = false;
  postEmoji: number = 0;
  answerEmoji: number = 0;

  newReaction: Reaction = new Reaction();


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

  //Code für Reactions für Answers auf Posts


  reactAnswer(chan_id: any, answer: any, i: any) {
    this.toggleEmojiPickerAnswer(i)
  }


  toggleEmojiPickerAnswer(i: any) {
    this.emojiPickerAnswerVisible = !this.emojiPickerAnswerVisible;
    this.answerEmoji = i;
  }


  selectEmojiAnswer($event: { emoji: { native: string } }, i: any, chan_id: any, answer: any) {
    const emoji = $event.emoji.native
    this.addEmojiToFirebaseAnswer(chan_id, answer, i, emoji)
  }


  addEmojiToFirebaseAnswer(chan_id: any, answer: any, i: any, emoji: any) {
    this.newReaction.answer_id = answer.id;
    this.newReaction.user = this.setUserObject(this.user);
    this.newReaction.amount = 1;
    this.newReaction.emoji = emoji;

    this.addOrUpdateReactionAnswer(chan_id, answer, this.setReactionObject(this.newReaction)).then(() => {
      this.toggleEmojiPickerAnswer(i);
    })
  }


  async addOrUpdateReactionAnswer(chan_id: any, answer: any, newReaction: any) {

    await runTransaction(this.firestore, async (transaction) => {
      const answDoc = await transaction.get(this.getAnswerDocRef(chan_id, answer.postId, answer.id))
      const answ = answDoc.data();

      if (!answ) {
        console.log("Answer-Daten nicht gefunden!")
      } else {

        const existingReactionIndex = answ['reactions'].findIndex((r: any) => r.emoji === newReaction.emoji);

        if (existingReactionIndex !== -1) {
          const updatedReactions = [...answ['reactions']];
          updatedReactions[existingReactionIndex] = { ...updatedReactions[existingReactionIndex], amount: updatedReactions[existingReactionIndex].amount + 1 };
          transaction.update(this.getAnswerDocRef(chan_id, answer.postId, answer.id), { reactions: updatedReactions });
        } else {
          const updatedReactions = [...answ['reactions'], newReaction];
          transaction.update(this.getAnswerDocRef(chan_id, answer.postId, answer.id), { reactions: updatedReactions })
        }
      }
    })
  }


  getAnswerDocRef(chan_id: any, post_id: any, answer_id: any) {
    return doc(this.firestore, "channels", chan_id, "posts", post_id, "answers", answer_id);
  }


  addReactionAnswer(chan_id: any, answer: any, i: any, reaction: any) {
    this.newReaction.answer_id = answer.id;
    this.newReaction.user = this.setUserObject(this.user);
    this.newReaction.amount = 1;
    this.newReaction.emoji = reaction.emoji;

    this.addOrUpdateReactionAnswer(chan_id, answer, this.setReactionObject(this.newReaction)).then(() => {
      if (this.emojiPickerAnswerVisible) {
        this.toggleEmojiPickerAnswer(i);
      }
    })
  }


  //Code für Reactions für Posts

  reactPost(chan_id: any, post: any, i: any) {
    this.toggleEmojiPicker(i);
  }


  selectEmoji($event: { emoji: { native: string } }, i: any, chan_id: any, post_id: any) {
    const emoji = $event.emoji.native
    this.addEmojiToFirebase(chan_id, post_id, i, emoji)
  }


  toggleEmojiPicker(i: any) {
    this.emojiPickerPostVisible = !this.emojiPickerPostVisible;
    this.postEmoji = i;
  }


  addEmojiToFirebase(chan_id: any, post_id: any, i: any, emoji: any) {
    this.newReaction.post_id = post_id;
    this.newReaction.user = this.setUserObject(this.user);
    this.newReaction.amount = 1;
    this.newReaction.emoji = emoji;

    this.addOrUpdateReaction(chan_id, post_id, this.setReactionObject(this.newReaction)).then(() => {
      this.toggleEmojiPicker(i);
    })
  }


  async addOrUpdateReaction(chan_id: any, post_id: any, newReaction: any) {

    await runTransaction(this.firestore, async (transaction) => {
      const postDoc = await transaction.get(this.getPostDocRef(chan_id, post_id))
      const post = postDoc.data();

      if (!post) {
        console.log("Post-Daten nicht gefunden!")
      } else {

        const existingReactionIndex = post['reactions'].findIndex((r: any) => r.emoji === newReaction.emoji);

        if (existingReactionIndex !== -1) {
          const updatedReactions = [...post['reactions']];
          updatedReactions[existingReactionIndex] = { ...updatedReactions[existingReactionIndex], amount: updatedReactions[existingReactionIndex].amount + 1 };
          transaction.update(this.getPostDocRef(chan_id, post_id), { reactions: updatedReactions });
        } else {
          const updatedReactions = [...post['reactions'], newReaction];
          transaction.update(this.getPostDocRef(chan_id, post_id), { reactions: updatedReactions })
        }
      }
    })
  }










  setReactionObject(obj: any) {
    return {
      id: obj.id || "",
      user: obj.user || "",
      emoji: obj.emoji || "",
      post_id: obj.post_id || "",
      answer_id: obj.answer_id || "",
      amount: obj.amount || 0

    }
  }





  addReactionPost(chan_id: any, post: any, i: any, reaction: any) {
    this.newReaction.post_id = post.id;
    this.newReaction.user = this.setUserObject(this.user);
    this.newReaction.amount = 1;
    this.newReaction.emoji = reaction.emoji;

    this.addOrUpdateReaction(chan_id, post.id, this.setReactionObject(this.newReaction)).then(() => {
      if (this.emojiPickerAnswerVisible) {
        this.toggleEmojiPicker(i);
      }
    })
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


  editPost(chan_id: any, post: any, i: any) {
    
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









