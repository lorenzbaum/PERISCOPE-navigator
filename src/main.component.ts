import {Component} from '@angular/core';
import {AppComponent} from "./app/app.component";


@Component({
  standalone: true,
  templateUrl: './index.html',
  styleUrl: './styles.scss',
  imports: [AppComponent]
})
export class MainComponent {
}
