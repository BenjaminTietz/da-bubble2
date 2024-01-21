import { Component, inject } from '@angular/core';
import { Post } from '../../../../models/post.class';
import { query, orderBy, limit, where, Firestore, collection, doc, getDoc, onSnapshot, addDoc, updateDoc, deleteDoc, setDoc, DocumentData, DocumentSnapshot, arrayUnion, FieldValue, getDocs } from '@angular/fire/firestore';




@Component({
  selector: 'app-delete-post',
  templateUrl: './delete-post.component.html',
  styleUrl: './delete-post.component.scss'
})
export class DeletePostComponent {

  firestore: Firestore = inject(Firestore);

  post!: Post;
  chan_id!: string;









  deletePost(post: any) {
    const colRef = this.getAnswerSubcollectionRef(this.chan_id, post.id);

    getDocs(colRef).then((snapshot) => {
      const deletePromises: any = [];
      snapshot.docs.forEach((doc) => {
        deletePromises.push(deleteDoc(doc.ref));
      });
      return Promise.all(deletePromises);
    }).then(() => {
      console.log('Alle Dokumente in der Subcollection wurden gelöscht');
    }).catch((error) => {
      console.error('Fehler beim Löschen der Subcollection:', error);
    });

  }


  getAnswerSubcollectionRef(chan_id: any, post_id: any) {
    return collection(this.firestore, 'channels', chan_id, 'posts', post_id, 'answers')
  }



}
