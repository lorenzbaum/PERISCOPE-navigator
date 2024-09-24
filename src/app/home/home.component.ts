import {ChangeDetectionStrategy, Component, inject, Input, OnInit} from '@angular/core';
import {GlobalService, URLParams} from '../global.service';
import {MatDialog} from '@angular/material/dialog';
import {ImageDialogComponent} from '../image-dialog/image-dialog.component';
import {NgOptimizedImage} from '@angular/common';
import {MatRippleModule} from '@angular/material/core';
import {MatCardModule} from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon';
import {RouterLink} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {MatGridListModule} from '@angular/material/grid-list';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MatGridListModule, MatButtonModule, RouterLink, MatIconModule, MatCardModule, MatRippleModule, NgOptimizedImage],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit {
  private globalService = inject(GlobalService);
  private matDialog = inject(MatDialog);

  protected readonly isXSmall = this.globalService.isXSmall;
  protected readonly isHandset = this.globalService.isHandset;
  protected readonly isTabletPortrait = this.globalService.isTabletPortrait;

  protected readonly version = this.globalService.version;
  protected readonly title = this.globalService.title;
  protected readonly recommenderLink: string = $localize`:routing:recommender`;

  @Input()
  SAVEDID?: string;
  @Input()
  PROLIFIC_PID?: string;
  @Input()
  STUDY_ID?: string;
  @Input()
  SESSION_ID?: string;

  ngOnInit() {
    const params: Array<'SAVEDID' | 'PROLIFIC_PID' | 'STUDY_ID' | 'SESSION_ID'> =
      ['SAVEDID', 'PROLIFIC_PID', 'STUDY_ID', 'SESSION_ID'];

    params.forEach(param => {
      if (this[param])
        this.globalService.urlParams = {[param]: this[param]} as URLParams;
    });
  }

  protected onOpenDialog(url: string, width: number = 1994 / 2, height: number = 758 / 2) {
    const ref = ImageDialogComponent.openDialog(this.matDialog, url, width, height);
    ref.afterClosed().subscribe(result => {
      //console.log(result);
    });
  }
}
