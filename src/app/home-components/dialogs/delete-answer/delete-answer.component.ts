import { Component, inject } from '@angular/core';
import { Answer } from '../../../../models/answer.class';
import { query, orderBy, limit, where, Firestore, collection, doc, getDoc, onSnapshot, addDoc, updateDoc, deleteDoc, setDoc, DocumentData, DocumentSnapshot, arrayUnion, FieldValue } from '@angular/fire/firestore';




@Component({
  selector: 'app-delete-answer',
  templateUrl: './delete-answer.component.html',
  styleUrl: './delete-answer.component.scss'
})
export class DeleteAnswerComponent {

  firestore: Firestore = inject(Firestore);

  answer!: Answer;
  chan_id!: string;




  deleteAnswer() {
    deleteDoc(doc(this.getAnswerRef(), this.answer.id));
  }


  getAnswerRef() {
    return collection(this.firestore, 'channels', this.chan_id, 'posts', this.answer.postId, 'answers');
  }




}
