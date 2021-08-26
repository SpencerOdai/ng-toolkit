import { Injectable } from '@angular/core';
import {
  Action,
  AngularFirestore,
  AngularFirestoreCollection,
  AngularFirestoreDocument,
  CollectionReference,
  DocumentChangeAction,
  DocumentReference,
  DocumentSnapshotDoesNotExist,
  DocumentSnapshotExists
} from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import firebase from 'firebase/app';
import { Observable, of } from 'rxjs';
import { catchError, map, take, tap } from 'rxjs/operators';

type CollectionPredicate<T> = string | AngularFirestoreCollection<T>;
type DocPredicate<T> = string | AngularFirestoreDocument<T>;

@Injectable({
  providedIn: 'root',
})
export class FirestoreService {
  /// **************
  /// Write Data
  /// **************

  /// Firebase Server Timestamp
  get timestamp(): firebase.firestore.FieldValue {
    return firebase.firestore.FieldValue.serverTimestamp();
  }

  constructor(private afs: AngularFirestore, private afStorage: AngularFireStorage) { }

  /// **************
  /// Get a Reference
  /// **************

  createId(): string {
    return this.afs.createId();
  }

  col<T>({ ref, queryFn }: { ref: CollectionPredicate<T>; queryFn?: any }): AngularFirestoreCollection<T> {
    return typeof ref === 'string' ? this.afs.collection<T>(ref, queryFn) : ref;
  }

  colRef<T>(ref: string): CollectionReference<T> {
    return this.afs.collection<T>(ref).ref;
  }

  doc<T>(ref: DocPredicate<T>): AngularFirestoreDocument<T> {
    return typeof ref === 'string' ? this.afs.doc<T>(ref) : ref;
  }

  docRef<T>(ref: string): DocumentReference<T> {
    return this.afs.doc<T>(ref).ref;
  }

  /// **************
  /// Get Data
  /// **************

  doc$<T>(ref: DocPredicate<T>): Observable<T | null> {
    return this.doc(ref)
      .snapshotChanges()
      .pipe(
        map((doc: Action<DocumentSnapshotDoesNotExist | DocumentSnapshotExists<T>>) => {
          return doc.payload.exists ? { id: doc.payload.id, ...doc.payload.data() } as T : null;
        }),
        catchError((err) => {
          console.warn(err);
          return of(null);
        })
      );
  }

  col$<T>(ref: CollectionPredicate<T>, queryFn?: any): Observable<T[]> {
    return this.col({ ref, queryFn })
      .snapshotChanges()
      .pipe(
        map((docs: Array<DocumentChangeAction<T>>) => {
          return docs.map((a: DocumentChangeAction<T>) => a.payload.doc.data()) as T[];
        }),
        catchError((err) => {
          console.warn(err);
          return of([]);
        })
      );
  }

  /// with Ids
  colWithIds$<T>(ref: CollectionPredicate<T>, queryFn?: undefined): Observable<T[]> {
    return this.col({ ref, queryFn })
      .snapshotChanges()
      .pipe(
        map((actions: Array<DocumentChangeAction<T>>) =>
          actions.map((a: DocumentChangeAction<T>) => (
            { id: a.payload.doc.id, type: a.type, ...a.payload.doc.data() }as T
          )
        ),
        catchError((err) => {
          console.warn(err);
          return of([]);
        })
      ));
  }

  /** set document update created and updated timestamp, use merge true to merge data if its an update */
  set<T>(ref: DocPredicate<T>, data: any): Promise<void> {
    const timestamp = this.timestamp;
    return this.doc(ref).set(
      {
        ...data,
        updatedAt: timestamp,
        createdAt: timestamp,
      },
      { merge: true }
    );
  }

  /** update data and timestamp */
  update<T>(ref: DocPredicate<T>, data: any): Promise<void> {
    return this.doc(ref).update({
      ...data,
      updatedAt: this.timestamp,
    });
  }

  delete<T>(ref: DocPredicate<T>): Promise<void> {
    return this.doc(ref).delete();
  }

  add<T>(ref: CollectionPredicate<T>, data: any): Promise<firebase.firestore.DocumentReference> {
    const timestamp = this.timestamp;
    return this.col({ ref }).add({
      ...data,
      updatedAt: timestamp,
      createdAt: timestamp,
    });
  }

  geopoint(lat: number, lng: number): firebase.firestore.GeoPoint {
    return new firebase.firestore.GeoPoint(lat, lng);
  }

  /// If doc exists update, otherwise set
  async upsert<T>(ref: DocPredicate<T>, data: any): Promise<void> {
    const doc = this.doc(ref).snapshotChanges().pipe(take(1)).toPromise();

    const snap = await doc;
    return await (snap.payload.exists ? this.update(ref, data) : this.set(ref, data));
  }

  /// *************
  /// Upload and multi upload ImageURI to Firestore using putString
  /// *************

  uploadManyImages(images: string[], store: string): Promise<string[]> {
    if (!images || images.length === 0) { return Promise.resolve([]); }
    return Promise.all(images.map((image, index) => this.uploadImage(image, store, this.createId())));
  }

  /**
   * update data_url formatted image to firebase
   */
  async uploadImage(imageURI: string, store: string, fileName: string | number): Promise<string> {
    const metadata: firebase.storage.UploadMetadata = {
      contentType: 'image/jpeg',
      cacheControl: 'public, max-age=300, s-maxage=600',
    };
    const storageRef = this.afStorage.storage.ref().child(`${store}/${fileName}`);
    const imageRef = storageRef.getDownloadURL();

    return new Promise((resolve, reject) =>
      imageRef.then(d => resolve(d))
        .catch(async (err) => {
          if (err.code === 'storage/object-not-found') {
            const image = await storageRef.putString(imageURI, 'data_url', metadata);
            resolve(await image.ref.getDownloadURL());
          }
          reject(err);
        })
    );
  }

  deleteManyFilesByUrl(urls: string[]): Promise<void[]>  {
    if (!urls || urls.length === 0) { return Promise.resolve([]); }
    return Promise.all(urls.map((url) => this.deleteFileByUrl(url)));
  }

  deleteFileByUrl(url: string): Promise<void> {
    return firebase.storage().refFromURL(url).delete();
  }

  /// **************
  /// Inspect Data
  /// **************

  inspectDoc(ref: DocPredicate<any>): void {
    const tick = new Date().getTime();
    this.doc(ref)
      .snapshotChanges()
      .pipe(
        take(1),
        tap((d: Action<DocumentSnapshotDoesNotExist | DocumentSnapshotExists<any>>) => {
          const tock = new Date().getTime() - tick;
          console.log(`Loaded Document in ${tock}ms`, d);
        })
      )
      .subscribe();
  }

  inspectCol(ref: CollectionPredicate<any>): void {
    const tick = new Date().getTime();
    this.col({ ref })
      .snapshotChanges()
      .pipe(
        take(1),
        tap((c: Array<DocumentChangeAction<any>>) => {
          const tock = new Date().getTime() - tick;
          console.log(`Loaded Collection in ${tock}ms`, c);
        })
      )
      .subscribe();
  }

  /// **************
  /// Create and read doc references
  /// **************

  /// create a reference between two documents
  connect(host: DocPredicate<any>, key: string, doc: DocPredicate<any>): Promise<void> {
    return this.doc(host).update({ [key]: this.doc(doc).ref });
  }

  /// returns a documents references mapped to AngularFirestoreDocument
  // docWithRefs$<T>(ref: DocPredicate<T>): Observable<T | null> {
  //   return this.doc$(ref).pipe(
  //     map((doc: T) => {
  //       for (const k of Object.keys(doc)) {
  //         if (doc[k] instanceof firebase.firestore.DocumentReference) {
  //           doc[k] = this.doc(doc[k].path);
  //         }
  //       }
  //       return doc;
  //     })
  //   );
  // }

  /**
   * Delete a collection, in batches of batchSize. Note that this does
   * not recursively delete sub-collections of documents in the collection
   * from: https://github.com/AngularFirebase/80-delete-firestore-collections/blob/master/src/app/firestore.service.ts
   */
  // deleteCollection(path: string, batchSize: number): Observable<any> {
  //   const source = this.deleteBatch(path, batchSize);

  //   // expand will call deleteBatch recursively until the collection is deleted
  //   return source.pipe(
  //     expand((val) => this.deleteBatch(path, batchSize)),
  //     takeWhile((val) => val > 0)
  //   );
  // }

  // Detects documents as batched transaction
  // private deleteBatch(path: string, batchSize: number): Observable<any> {
  //   const colRef = this.afs.collection(path, (ref) => ref.orderBy('__name__').limit(batchSize));

  //   return colRef.snapshotChanges().pipe(
  //     take(1),
  //     mergeMap((snapshot: Array<DocumentChangeAction<{}>>) => {
  //       // Delete documents in a batch
  //       const batch = this.afs.firestore.batch();
  //       snapshot.forEach((doc) => {
  //         batch.delete(doc.payload.doc.ref);
  //       });

  //       return from(batch.commit()).pipe(map(() => snapshot.length));
  //     })
  //   );
  // }
}
