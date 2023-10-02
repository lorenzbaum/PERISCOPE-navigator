import {Component, inject} from '@angular/core';
import {GlobalService} from "../global.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent {
  private router = inject(Router);

  private globalService = inject(GlobalService);
  protected readonly title = this.globalService.title;
  protected readonly shortTitle = this.globalService.shortTitle;
  protected readonly like$ = this.globalService.like$;

  protected readonly likeString = $localize`:Like button:Like`;
  protected readonly dislikeString = $localize`:Like button:Dislike`;

  protected readonly isXSmall$ = this.globalService.isXSmall$;

  protected onShare() {
    navigator?.share({
      title: this.title,
      text: $localize`:Share text|Text to share:Check out this privacy-friendliness business model navigator!`,
      url: this.router.url,
    }).then(() => console.log('Shared...'));
  }

  protected onLikeDislike() {
    this.globalService.toggleLikeDislike();
  }
}
