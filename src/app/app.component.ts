import {Component} from '@angular/core';
import {Title} from "@angular/platform-browser";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  version: string = 'v0.0.1';
  title: string = $localize`:App name|Name of the App:Privacy-friendliness Business Model Navigator (${this.version}:version:)`;

  constructor(private titleService: Title) {
    this.titleService.setTitle(this.title);
  }

  protected readonly alert = alert;
}
