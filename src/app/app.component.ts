import {Component, inject} from '@angular/core';
import {Title} from "@angular/platform-browser";
import {Router} from "@angular/router";
import {GlobalService} from "./global.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  private title = inject(GlobalService).title;
  combinedTitle = inject(GlobalService).combinedTitle;

  constructor(private titleService: Title) {
    this.titleService.setTitle(this.combinedTitle);
  }

  private router = inject(Router);

  onShare() {
    navigator?.share({
      title: this.title,
      text: $localize`:Share text|Text to share:Check out this privacy-friendliness business model navigator!`,
      url: this.router.url,
    });
  }
}
