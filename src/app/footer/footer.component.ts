import {Component, inject} from '@angular/core';
import {GlobalService} from "../global.service";
import {NgOptimizedImage, AsyncPipe} from '@angular/common';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
  standalone: true,
  imports: [MatGridListModule, NgOptimizedImage, AsyncPipe, MatProgressSpinnerModule]
})
export class FooterComponent {
  private globalService = inject(GlobalService);
  protected readonly version = this.globalService.version;
  protected readonly title = this.globalService.title;

  protected readonly isXSmall = this.globalService.isXSmall;
}
