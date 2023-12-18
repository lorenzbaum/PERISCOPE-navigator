import {Component, inject} from '@angular/core';
import {GlobalService} from "./global.service";
import {AsyncPipe} from '@angular/common';
import {FooterComponent} from './footer/footer.component';
import {RouterOutlet} from '@angular/router';
import {ToolbarComponent} from './toolbar/toolbar.component';
import {MatIconRegistry} from "@angular/material/icon";


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  standalone: true,
  imports: [
    ToolbarComponent,
    RouterOutlet,
    FooterComponent,
    AsyncPipe,
  ],
})
export class AppComponent {
  private globalService = inject(GlobalService);
  protected readonly darkModeActive = this.globalService.darkTheme$;

  protected onSwitchTheme(theme: boolean) {
    this.globalService.darkTheme = theme;
  }

  constructor(matIconRegistry: MatIconRegistry) {
    matIconRegistry.setDefaultFontSetClass('material-symbols-outlined');
  }
}
