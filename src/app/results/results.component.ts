import {ChangeDetectionStrategy, Component, effect, inject, signal} from '@angular/core';
import {Analysis, GlobalService} from '../global.service';
import {Router} from '@angular/router';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatButtonModule} from '@angular/material/button';
import {MatDividerModule} from '@angular/material/divider';
import {MatIconModule} from '@angular/material/icon';
import {MatCardModule} from '@angular/material/card';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {AsyncPipe, DecimalPipe, NgTemplateOutlet, PercentPipe} from '@angular/common';
import {GaugeComponent} from './gauge/gauge.component';

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [
    MatProgressSpinnerModule,
    MatGridListModule,
    MatCardModule,
    MatIconModule,
    MatDividerModule,
    MatButtonModule,
    NgTemplateOutlet,
    MatExpansionModule,
    AsyncPipe,
    DecimalPipe,
    PercentPipe,
    GaugeComponent
  ],
  templateUrl: './results.component.html',
  styleUrl: './results.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResultsComponent {
  private globalService = inject(GlobalService);
  private router = inject(Router);

  protected isHandset = this.globalService.isHandset;
  protected isTabletPortrait = this.globalService.isTabletPortrait;

  protected choiceData = this.globalService.choiceData$;
  protected analysis = signal<Analysis | undefined>(undefined);

  protected choiceStrings = this.globalService.choiceValues;

  protected currentStar = 0;

  constructor() {
    effect(async () => {
      console.log(this.choiceData());
      this.analysis.set(await this.globalService.getAnalysis(this.choiceData()));
      console.log(this.analysis);
    }, {allowSignalWrites: true});
  }

  protected onRate(rating: number) {
    const url = `//www.privacy-friendly-business.com/feedback?rating=${rating}`;
    let handle = window.open(url, '_blank');
    if (!handle) {
      console.error('Blocked');
      this.router.navigateByUrl(url);
    }
  }
}
