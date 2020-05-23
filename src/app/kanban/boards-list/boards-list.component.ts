import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Subscription, Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { BoardDialogComponent } from '../dialogs/board-dialog.component';
import { Board } from '../board.model';
import { BoardService } from '../board.service';
import { ProjectDataService } from '../project-list/project-data.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-boards-list',
  templateUrl: './boards-list.component.html',
  styleUrls: ['./boards-list.component.scss'],
})
export class BoardsListComponent implements OnInit, OnDestroy {
  boards: Board[];
  sub: Subscription;
  projectId: string;

  constructor(
    private route: ActivatedRoute,
    public boardService: BoardService,
    public dialog: MatDialog,
    private project: ProjectDataService
  ) {}

  ngOnInit() {
    this.projectId = this.route.snapshot.paramMap.get('id');

    this.sub = this.boardService
      .getUserBoards(this.projectId)
      .subscribe((boards) => (this.boards = boards));
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.boards, event.previousIndex, event.currentIndex);
    this.boardService.sortBoards(this.boards);
  }

  openBoardDialog(): void {
    const dialogRef = this.dialog.open(BoardDialogComponent, {
      width: '400px',
      data: {},
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.boardService.createBoard({
          title: result,
          projectId: this.projectId,
          priority: this.boards.length,
        });
      }
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  taskMoved({ previous, next }) {
    const previousTasks = this.boards.find((b) => b.id === previous).tasks;
    const nextTasks = this.boards.find((b) => b.id === next).tasks;

    this.boardService.moveTask(previous, previousTasks, next, nextTasks);
  }
}
