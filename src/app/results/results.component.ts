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
import {DecimalPipe, NgTemplateOutlet, PercentPipe} from '@angular/common';
import {GaugeComponent} from './gauge/gauge.component';
import {MatTooltip} from "@angular/material/tooltip";

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
    DecimalPipe,
    PercentPipe,
    GaugeComponent,
    MatTooltip
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

  private urlParams = this.globalService.urlParams$;

  protected choiceStrings = this.globalService.choiceStrings;

  protected currentStar = 0;

  constructor() {
    effect(async () => {
      console.log(this.choiceData());
      this.analysis.set(await this.globalService.getAnalysis(this.choiceData()));
      console.log(this.analysis());
    }, {allowSignalWrites: true});
  }

  protected onRate(rating: number) {
    if (this.analysis() && this.choiceData()) {
      const urlParams = Object.keys(this.urlParams()).map(key => `${key}=${this.urlParams()[key]}`).join('&');
      const contextUrlParams = `sum=${this.analysis()!.sum}&rating=${rating}&pf=${this.choiceData()!['privacyEstimation']}`;
      const url = `//umfrage.wiim-research.de/index.php/294222?${urlParams}&${contextUrlParams}`;
      let handle = window.open(url, '_self');  // , '_blank'
      if (!handle) {
        console.error('Blocked');
        this.router.navigateByUrl(url);
      }
    }
  }
}
