import {ChangeDetectionStrategy, Component, effect, inject, signal, untracked} from '@angular/core';
import {Analysis, GlobalService, RecommenderChoices} from '../global.service';
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
import {MatOption} from "@angular/material/core";
import {MatFormField, MatLabel, MatSelect} from "@angular/material/select";
import {timer} from "rxjs";

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
    MatTooltip,
    MatOption,
    MatSelect,
    MatLabel,
    MatFormField
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
  protected runningAnalysis = signal<boolean>(false);

  private urlParams = this.globalService.urlParams$;

  protected choiceStrings = this.globalService.choiceStrings;

  protected currentStar = 0;
  protected consumerLocation = signal<string | undefined>(undefined);

  constructor() {
    effect(async () => {
      console.log(this.choiceData());
      this.consumerLocation.set(this.choiceData()?.['consumerLocation'] as string);
      if (!untracked(this.runningAnalysis))
        this.analysis.set(await this.getAnalysis(this.choiceData()));
    }, {allowSignalWrites: true});

    effect(async () => {
      console.log(this.consumerLocation());
      const region = this.consumerLocation();
      if (!untracked(this.runningAnalysis))
        this.analysis.set(await this.getAnalysis(untracked(this.choiceData), region));
    }, {allowSignalWrites: true});
  }

  private async getAnalysis(choiceData: RecommenderChoices | undefined, region?: string) {
    if (choiceData === undefined)
      return undefined;
    this.runningAnalysis.set(true);
    timer(700).subscribe(() => this.runningAnalysis.set(false));
    const analysis = await this.globalService.getAnalysis(choiceData, region)
    console.log(analysis);
    return analysis;
  }

  protected onRate(rating: number) {
    if (this.analysis() !== undefined && this.choiceData()) {
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
