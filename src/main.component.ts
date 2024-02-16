import {Component} from '@angular/core';
import {AppComponent} from './app/app.component';


@Component({
  standalone: true,
  imports: [AppComponent],
  templateUrl: './index.html',
  styleUrl: './styles.scss'
})
export class MainComponent {
}
