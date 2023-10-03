import {Component, inject} from '@angular/core';
import {Analysis, GlobalService} from "../global.service";
import {Router} from "@angular/router";
import {timer} from "rxjs";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.scss']
})
export class ResultsComponent {
  private globalService = inject(GlobalService);
  private router = inject(Router);

  protected isHandset$ = this.globalService.isHandset$;
  protected isTabletPortrait$ = this.globalService.isTabletPortrait$;

  protected choiceData$ = this.globalService.choiceData$;
  protected analysis: Analysis | undefined = undefined;

  protected currentStar = 0;

  constructor() {
    if (!this.globalService.choiceData) {
      console.warn('No choice data received!');
      this.router.navigate(['/'], {replaceUrl: true}).then(() => console.log('Navigated to /...'));
    } else {
      this.choiceData$
        .pipe(takeUntilDestroyed())
        .subscribe(choiceData => {
          console.log(choiceData);
          this.analysis = undefined;
          timer(600).subscribe(async () => {
            this.analysis = await this.globalService.getAnalysis();
            console.log(this.analysis);
            setTimeout(()=> this.createGauge(), 1000);
          });
        });
    }
  }

  gauge: any;

  private createGauge() {
    const config = {
      type: 'gauge',
      data: {
        datasets: [{
          value: this.analysis?.quantile || 0,
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
          widthPercentage: 3.2,
          lengthPercentage: 60,
          color: 'rgba(20, 20, 20, 1)'
        },
        layout: {
          padding: {
            right: 20,
            left: 20,
            bottom: 20
          }
        },
        valueLabel: {
          display: false,
          formatter: (value: number) => {
            return Math.round(value * 100) + ' %';
          },
          color: 'rgba(0, 0, 0, 1)',
          backgroundColor: 'rgba(255, 255, 255, 1)',
          borderRadius: 5,
          padding: {
            top: 5,
            right: 5,
            bottom: 5,
            left: 5
          },
          bottomMarginPercentage: 5,
        }
      }
    };
    const canvas = document.getElementById('gauge')! as HTMLCanvasElement;
    if (canvas) {
      const ctx = canvas.getContext('2d')!;
      // @ts-ignore
      this.gauge = new Chart(ctx, config);
    }
  }

  protected onRate(rating: number) {
    const url = `//www.privacy-friendly-business.com/feedback?rating=${rating}`;
    let handle = window.open(url, '_blank');
    if (!handle) {
      console.error("Blocked");
      this.router.navigateByUrl(url)
    }
  }

  protected readonly undefined = undefined;
}
