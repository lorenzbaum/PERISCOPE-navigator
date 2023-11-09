import {Component, inject} from '@angular/core';
import {GlobalService} from "../global.service";
import {NgIf, NgOptimizedImage, AsyncPipe} from '@angular/common';
import {MatGridListModule} from '@angular/material/grid-list';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
  standalone: true,
  imports: [MatGridListModule, NgIf, NgOptimizedImage, AsyncPipe]
})
export class FooterComponent {
  private globalService = inject(GlobalService);
  protected readonly version = this.globalService.version;
  protected readonly title = this.globalService.title;

  protected readonly isXSmall$ = this.globalService.isXSmall$;
}
