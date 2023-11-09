import {Component, inject} from '@angular/core';
import {Analysis, GlobalService} from "../global.service";
import {Router} from "@angular/router";
import {timer} from "rxjs";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {MatExpansionModule} from '@angular/material/expansion';
import {MatButtonModule} from '@angular/material/button';
import {MatDividerModule} from '@angular/material/divider';
import {MatIconModule} from '@angular/material/icon';
import {MatCardModule} from '@angular/material/card';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {
  NgIf,
  NgSwitch,
  NgSwitchCase,
  NgFor,
  NgTemplateOutlet,
  AsyncPipe,
  DecimalPipe,
  PercentPipe
} from '@angular/common';

declare var Chart: any;

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrl: './results.component.scss',
  standalone: true,
  imports: [NgIf, MatProgressSpinnerModule, MatGridListModule, MatCardModule, NgSwitch, NgSwitchCase, MatIconModule, MatDividerModule, NgFor, MatButtonModule, NgTemplateOutlet, MatExpansionModule, AsyncPipe, DecimalPipe, PercentPipe]
})
export class ResultsComponent {
  private globalService = inject(GlobalService);
  private router = inject(Router);

  protected isHandset$ = this.globalService.isHandset$;
  protected isTabletPortrait$ = this.globalService.isTabletPortrait$;

  protected choiceData$ = this.globalService.choiceData$;
  protected analysis: Analysis | undefined = undefined;
  protected showAnalysis = false;

  protected choiceStrings = this.globalService.choiceValues;

  protected currentStar = 0;

  constructor() {
    if (!this.globalService.choiceData) {
      console.warn('No choice data received!');
      this.router.navigate(['/'], {replaceUrl: true}).then(() => console.log('Navigated to /...'));
    } else {
      this.choiceData$
        .pipe(takeUntilDestroyed())
        .subscribe(async choiceData => {
          this.showAnalysis = false;
          console.log(choiceData);
          this.analysis = await this.globalService.getAnalysis(choiceData);
          console.log(this.analysis);
          setTimeout(() => this.createGauge(this.analysis), 100);
          timer(600).subscribe(() => {
            this.showAnalysis = true;
          });
        });
    }
  }

  private gauge: any;

  private createGauge(analysis: Analysis | undefined) {
    const config = {
      type: 'gauge',
      data: {
        datasets: [{
          value: analysis?.quantile || 0.5,
          minValue: 0,
          data: [.2, .4, .6, .8, 1.0],
          backgroundColor: [
            '#f44336',
            '#ff9100',
            '#ffd740',
            '#aeea00',
            '#4caf50',
          ],
          borderWidth: 4,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        needle: {
          radiusPercentage: 2,
          widthPercentage: 4,
          lengthPercentage: 65,
          color: '#28017c',
        },
        layout: {
          padding: {
            right: 30,
            left: 30,
            bottom: 20
          }
        },
        valueLabel: {
          display: false
        }
      }
    };
    const canvas = document.getElementById('gauge')! as HTMLCanvasElement;
    if (canvas) {
      const ctx = canvas.getContext('2d')!;
      this.gauge = new Chart(ctx, config);
    }
  }

  protected onRate(rating: number) {
    const url = `//www.privacy-friendly-business.com/feedback?rating=${rating}`;
    let handle = window.open(url, '_blank');
    if (!handle) {
      console.error("Blocked");
      this.router.navigateByUrl(url);
    }
  }

  protected readonly ValidityState = ValidityState;
}
