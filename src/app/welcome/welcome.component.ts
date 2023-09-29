import {Component, inject} from '@angular/core';
import {GlobalService} from "../global.service";

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent {
  private globalService = inject(GlobalService);

  protected readonly isHandset$ = this.globalService.isHandset$;

  protected readonly version = this.globalService.version;
  protected readonly title = this.globalService.title;
  protected readonly navigatorLink: string = $localize`:routing:navigator`;
}
