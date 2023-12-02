import {Component, inject} from '@angular/core';
import {GlobalService} from "../global.service";
import {MatDialog} from "@angular/material/dialog";
import {ImageDialogComponent} from "../image-dialog/image-dialog.component";
import {NgOptimizedImage, AsyncPipe} from '@angular/common';
import {MatRippleModule} from '@angular/material/core';
import {MatCardModule} from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon';
import {RouterLink} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {MatGridListModule} from '@angular/material/grid-list';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  standalone: true,
  imports: [MatGridListModule, MatButtonModule, RouterLink, MatIconModule, MatCardModule, MatRippleModule, NgOptimizedImage, AsyncPipe]
})
export class HomeComponent {
  private globalService = inject(GlobalService);
  private matDialog = inject(MatDialog);

  protected readonly isXSmall = this.globalService.isXSmall;
  protected readonly isHandset = this.globalService.isHandset;
  protected readonly isTabletPortrait = this.globalService.isTabletPortrait;

  protected readonly version = this.globalService.version;
  protected readonly title = this.globalService.title;
  protected readonly recommenderLink: string = $localize`:routing:recommender`;

  protected onOpenDialog(url: string, width: number = 1994 / 2, height: number = 758 / 2) {
    const ref = ImageDialogComponent.openDialog(this.matDialog, url, width, height);
    ref.afterClosed().subscribe(result => {
      //console.log(result);
    });
  }
}
