import {Component, inject, OnInit} from '@angular/core';
import {BreakpointObserver} from '@angular/cdk/layout';
import {GlobalService} from "../global.service";
import {Router} from "@angular/router";
import {Title} from "@angular/platform-browser";

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent implements OnInit {
  private router = inject(Router);
  private titleService = inject(Title);

  private globalService = inject(GlobalService);
  private combinedTitle = this.globalService.combinedTitle;
  title = this.globalService.title;

  ngOnInit() {
    this.titleService.setTitle(this.combinedTitle);
  }

  onShare() {
    navigator?.share({
      title: this.title,
      text: $localize`:Share text|Text to share:Check out this privacy-friendliness business model navigator!`,
      url: this.router.url,
    }).then(() => console.log('Shared...'));
  }
}
