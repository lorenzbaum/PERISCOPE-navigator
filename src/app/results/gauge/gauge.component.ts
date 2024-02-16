import {ChangeDetectionStrategy, Component, effect, ElementRef, inject, input, NgZone, viewChild} from '@angular/core';

declare var Chart: any;

@Component({
  selector: 'app-gauge',
  standalone: true,
  imports: [],
  templateUrl: './gauge.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GaugeComponent {
  quantile = input.required<number>();
  private canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('gauge');
  private ngZone = inject(NgZone);
  private gauge: typeof Chart;

  constructor() {
    effect(() => this.createGauge(this.quantile(), this.canvas().nativeElement));
  }

  private createGauge(quantile: number, canvas: HTMLCanvasElement) {
    const config = {
      type: 'gauge',
      data: {
        datasets: [{
          value: quantile,
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
    const ctx = canvas.getContext('2d')!;
    this.gauge = this.ngZone.runOutsideAngular(() => new Chart(ctx, config));
  }
}
