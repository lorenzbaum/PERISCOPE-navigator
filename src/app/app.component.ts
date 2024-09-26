import {Component, inject} from '@angular/core';
import {GlobalService} from "./global.service";
import {AsyncPipe} from '@angular/common';
import {FooterComponent} from './footer/footer.component';
import {ActivatedRoute, RouterOutlet} from '@angular/router';
import {ToolbarComponent} from './toolbar/toolbar.component';
import {MatIconRegistry} from "@angular/material/icon";


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    ToolbarComponent,
    RouterOutlet,
    FooterComponent,
    AsyncPipe,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  private globalService = inject(GlobalService);
  protected theme = this.globalService.themeSignal;
  protected readonly autoTheme = this.globalService.autoThemeSignal;

  constructor(matIconRegistry: MatIconRegistry, activatedRoute: ActivatedRoute) {
    matIconRegistry.setDefaultFontSetClass('material-symbols-outlined');
    activatedRoute.queryParams.subscribe(params => {
      if (Object.keys(params).length != 0) this.globalService.urlParams = params;
    });
  }
}
