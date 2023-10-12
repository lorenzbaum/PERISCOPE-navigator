import {Component, EventEmitter, inject, Input, Output} from '@angular/core';
import {GlobalService} from "../global.service";
import {DOCUMENT} from '@angular/common';
import {MatSlideToggleChange} from "@angular/material/slide-toggle";

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent {
  private document = inject(DOCUMENT);

  private globalService = inject(GlobalService);
  protected readonly title = this.globalService.title;
  protected readonly shortTitle = this.globalService.shortTitle;
  protected readonly like$ = this.globalService.like$;

  protected readonly likeString = $localize`:Like button:Like`;
  protected readonly dislikeString = $localize`:Like button:Dislike`;

  protected readonly isHandset$ = this.globalService.isHandset$;
  protected readonly isTabletPortrait$ = this.globalService.isTabletPortrait$;

  protected onShare() {
    navigator?.share({
      title: this.title,
      text: $localize`:Share text|Text to share:Check out this Privacy-friendliness Business Model Recommender!`,
      url: this.document.baseURI,
    }).then(() => console.log('Shared...'));
  }

  protected onLikeDislike() {
    this.globalService.toggleLikeDislike();
  }

  @Input()
  theme!: boolean;

  @Output()
  private readonly themeChange = new EventEmitter<boolean>();

  protected onSwitchTheme(event: MatSlideToggleChange) {
    this.theme = !event.checked;
    this.themeChange.emit(!event.checked);
  }
}
