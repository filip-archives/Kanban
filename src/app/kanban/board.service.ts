import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import * as firebase from 'firebase/app';
import { switchMap, map } from 'rxjs/operators';
import { Project, Board, Task } from './board.model';

@Injectable({
  providedIn: 'root',
})
export class BoardService {
  constructor(private afAuth: AngularFireAuth, private db: AngularFirestore) {}

  /**
   * Create a new project for current user
   */
  async createProject(data: Project) {
    const user = await this.afAuth.currentUser;
    return this.db.collection('projects').add({
      ...data,
      uid: user.uid,
      Board: [],
    });
  }

  /**
   * Creates a new board for the current user
   */
  async createBoard(data: Board) {
    const user = await this.afAuth.currentUser;
    return this.db.collection('boards').add({
      ...data,
      uid: user.uid,
      tasks: [{ description: 'Hello!', label: 'yellow' }],
    });
  }

  /**
   * Get all user projects
   */
  getUserProjects() {
    return this.afAuth.authState.pipe(
      switchMap((user) => {
        if (user) {
          return this.db
            .collection<Project>('projects', (ref) =>
              ref.where('uid', '==', user.uid).orderBy('priority')
            )
            .valueChanges({ idField: 'id' });
        } else {
          return [];
        }
      })
    );
  }

  /**
   * Get all boards owned by current user
   */
  getUserBoards(projectId: string) {
    return this.afAuth.authState.pipe(
      switchMap((user) => {
        if (user) {
          return this.db
            .collection<Board>('boards', (ref) =>
              ref.where('projectId', '==', projectId).orderBy('priority')
            )
            .valueChanges({ idField: 'id' });
        } else {
          return [];
        }
      })
      // map(boards => boards.sort((a, b) => a.priority - b.priority))
    );
  }

  /**
   * Run a batch to change the priority of each project for sorting
   */
  sortProjects(projects: Project[]) {
    const db = firebase.firestore();
    const batch = db.batch();
    const refs = projects.map((p) => db.collection('projects').doc(p.id));
    refs.forEach((ref, idx) => batch.update(ref, { priority: idx }));
    batch.commit();
  }

  /**
   * Run a batch write to change the priority of each board for sorting
   */
  sortBoards(boards: Board[]) {
    const db = firebase.firestore();
    const batch = db.batch();
    const refs = boards.map((b) => db.collection('boards').doc(b.id));
    refs.forEach((ref, idx) => batch.update(ref, { priority: idx }));
    batch.commit();
  }

  /**
   * Delete project
   */
  deleteProject(projectId: string) {
    return this.db.collection('projects').doc(projectId).delete();
  }

  /**
   * Delete board
   */
  deleteBoard(boardId: string) {
    return this.db.collection('boards').doc(boardId).delete();
  }

  /**
   * Updates the tasks on board
   */
  updateTasks(boardId: string, tasks: Task[]) {
    return this.db.collection('boards').doc(boardId).update({ tasks });
  }

  /**
   * Remove a specifc task from the board
   */
  removeTask(boardId: string, task: Task) {
    return this.db
      .collection('boards')
      .doc(boardId)
      .update({
        tasks: firebase.firestore.FieldValue.arrayRemove(task),
      });
  }

  /**
   *
   * Move tasks between boards
   *
   * @param previousBoardId
   * @param previousTasks
   * @param boardId
   * @param tasks
   */
  moveTask(
    previousBoardId: string,
    previousTasks: Task[],
    boardId: string,
    tasks: Task[]
  ) {
    const db = firebase.firestore();
    const batch = db.batch();
    const previousRef = db.collection('boards').doc(previousBoardId);
    const nextRef = db.collection('boards').doc(boardId);
    batch.update(previousRef, { tasks: previousTasks });
    batch.update(nextRef, { tasks: tasks });
    batch.commit().catch((err) => console.error(err));
  }
}
