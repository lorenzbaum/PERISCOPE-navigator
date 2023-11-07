import {Component, inject} from '@angular/core';
import {GlobalService} from "./global.service";


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  private globalService = inject(GlobalService);
  protected readonly darkModeActive = this.globalService.darkTheme;
  protected readonly darkModeActive$ = this.globalService.darkTheme$;

  protected onSwitchTheme(theme: boolean) {
    this.globalService.darkTheme = theme;
  }
}
