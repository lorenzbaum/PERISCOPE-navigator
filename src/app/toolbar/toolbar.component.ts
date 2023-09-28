import {Component, inject} from '@angular/core';
import {GlobalService} from "../global.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent {
  private router = inject(Router);

  private globalService = inject(GlobalService);
  title = this.globalService.title;
  like$ = this.globalService.like$;

  protected likeString = $localize`:Like button:Like`;
  protected dislikeString = $localize`:Like button:Dislike`;

  onShare() {
    navigator?.share({
      title: this.title,
      text: $localize`:Share text|Text to share:Check out this privacy-friendliness business model navigator!`,
      url: this.router.url,
    }).then(() => console.log('Shared...'));
  }

  onLikeDislike() {
    this.globalService.toggleLikeDislike();
  }
}
