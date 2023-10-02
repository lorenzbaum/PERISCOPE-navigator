import {Component, inject} from '@angular/core';
import {GlobalService} from "../global.service";

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent {
  private globalService = inject(GlobalService);

  protected readonly isXSmall$ = this.globalService.isXSmall$;
  protected readonly isHandset$ = this.globalService.isHandset$;
  protected readonly isTablet$ = this.globalService.isTablet$;
  protected readonly isTabletPortrait$ = this.globalService.isTabletPortrait$;

  protected readonly version = this.globalService.version;
  protected readonly title = this.globalService.title;
  protected readonly navigatorLink: string = $localize`:routing:navigator`;
}
