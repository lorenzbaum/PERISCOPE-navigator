import {Component, inject} from '@angular/core';
import {GlobalService} from '../global.service';
import {NgOptimizedImage} from '@angular/common';
import {MatGridListModule} from '@angular/material/grid-list';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [MatGridListModule, NgOptimizedImage],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  private globalService = inject(GlobalService);
  protected readonly version = this.globalService.version;
  protected readonly title = this.globalService.title;

  protected readonly isXSmall = this.globalService.isXSmall;
}
