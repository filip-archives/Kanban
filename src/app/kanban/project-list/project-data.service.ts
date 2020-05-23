import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProjectDataService {
  projects = null;
  subscription;

  subscribeToProjects() {
    if (!this.projects) {
      this.subscription = this.db
        .collection('projects')
        .valueChanges({ idField: 'id' })
        .subscribe((projects) => {
          this.projects = projects;
        });
    }
  }

  getProject(id: string) {
    if (this.projects) {
      const cached = this.projects.find((v) => v.id === id);
      console.log('use cached');
      return of(cached);
    } else {
      console.log('use db');
      return this.db.collection('projects').doc(id).valueChanges();
    }
  }

  dispose() {
    this.subscription.unsubscribe();
    this.projects = null;
  }

  constructor(private db: AngularFirestore) {}
}
