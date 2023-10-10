import {Component, inject} from '@angular/core';
import {GlobalService} from "../global.service";
import {MatDialog} from "@angular/material/dialog";
import {ImageDialogComponent} from "../image-dialog/image-dialog.component";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  private globalService = inject(GlobalService);
  private matDialog = inject(MatDialog);

  protected readonly isXSmall$ = this.globalService.isXSmall$;
  protected readonly isHandset$ = this.globalService.isHandset$;
  protected readonly isTabletPortrait$ = this.globalService.isTabletPortrait$;

  protected readonly version = this.globalService.version;
  protected readonly title = this.globalService.title;
  protected readonly navigatorLink: string = $localize`:routing:navigator`;

  protected onOpenDialog(url: string, width: number = 1994 / 2, height: number = 758 / 2) {
    const ref = ImageDialogComponent.openDialog(this.matDialog, url, width, height);
    ref.afterClosed().subscribe(result => {
      //console.log(result);
    });
  }
}
