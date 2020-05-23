import { Component, OnInit, OnDestroy } from '@angular/core';
import { moveItemInArray, CdkDragDrop } from '@angular/cdk/drag-drop';

import { MatDialog } from '@angular/material/dialog';
import { BoardService } from '../board.service';
import { Project } from '../board.model';
import { Subscription } from 'rxjs';
import { ProjectDialogComponent } from '../dialogs/project-dialog.component';
import { ProjectDataService } from './project-data.service';

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.scss'],
})
export class ProjectListComponent implements OnInit, OnDestroy {
  projects: Project[];
  sub: Subscription;

  constructor(private boardService: BoardService, private dialog: MatDialog) {}

  ngOnInit() {
    this.sub = this.boardService
      .getUserProjects()
      .subscribe((projects) => (this.projects = projects));
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.projects, event.previousIndex, event.currentIndex);
    this.boardService.sortProjects(this.projects);
  }

  openProjectDialog(): void {
    const dialogRef = this.dialog.open(ProjectDialogComponent, {
      width: '400px',
      data: {},
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.boardService.createProject({
          title: result,
          priority: this.projects.length,
        });
      }
    });
  }
}
