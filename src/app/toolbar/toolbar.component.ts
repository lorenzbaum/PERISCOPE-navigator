import {Component, computed, EventEmitter, inject, input, Output} from '@angular/core';
import {GlobalService} from '../global.service';
import {AsyncPipe, DOCUMENT} from '@angular/common';
import {MatSlideToggleChange, MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatIconModule} from '@angular/material/icon';
import {RouterLink} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {MatToolbarModule} from '@angular/material/toolbar';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatButtonModule,
    RouterLink,
    MatIconModule,
    MatSlideToggleModule,
    MatTooltipModule,
    AsyncPipe
  ],
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.scss'
})
export class ToolbarComponent {
  private document = inject(DOCUMENT);

  private globalService = inject(GlobalService);
  protected readonly like = this.globalService.like$;

  protected readonly likeString = $localize`:Like button:Like`;
  protected readonly dislikeString = $localize`:Like button:Dislike`;

  protected readonly title = computed(() => this.globalService.isHandset() || this.globalService.isTabletPortrait() ? this.globalService.shortTitle : this.globalService.title);

  protected onShare() {
    navigator?.share({
      title: this.globalService.title,
      text: $localize`:Share text|Text to share:Check out this Privacy-friendliness Business Model Recommender!`,
      url: this.document.baseURI,
    }).then(() => console.log('Shared...'));
  }

  protected onLikeDislike() {
    this.globalService.toggleLikeDislike();
  }

  theme = input<boolean>();

  @Output()
  private readonly themeChange = new EventEmitter<boolean>();

  protected onSwitchTheme(event: MatSlideToggleChange) {
    this.themeChange.emit(!event.checked);
  }
}
