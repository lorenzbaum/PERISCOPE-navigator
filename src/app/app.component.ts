import {Component, inject, OnInit} from '@angular/core';
import {Title} from "@angular/platform-browser";
import {GlobalService} from "./global.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  private titleService = inject(Title);
  private title = inject(GlobalService).title;

  ngOnInit() {
    this.titleService.setTitle(this.title);
  }
}
