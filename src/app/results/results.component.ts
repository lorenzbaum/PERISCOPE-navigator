import {Component, inject} from '@angular/core';
import {Analysis, GlobalService} from "../global.service";
import {Router} from "@angular/router";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {MatExpansionModule} from '@angular/material/expansion';
import {MatButtonModule} from '@angular/material/button';
import {MatDividerModule} from '@angular/material/divider';
import {MatIconModule} from '@angular/material/icon';
import {MatCardModule} from '@angular/material/card';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {NgTemplateOutlet, AsyncPipe, DecimalPipe, PercentPipe} from '@angular/common';
import {GaugeComponent} from "./gauge/gauge.component";

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrl: './results.component.scss',
  standalone: true,
  imports: [MatProgressSpinnerModule, MatGridListModule, MatCardModule, MatIconModule, MatDividerModule, MatButtonModule, NgTemplateOutlet, MatExpansionModule, AsyncPipe, DecimalPipe, PercentPipe, GaugeComponent]
})
export class ResultsComponent {
  private globalService = inject(GlobalService);
  private router = inject(Router);

  protected isHandset = this.globalService.isHandset;
  protected isTabletPortrait = this.globalService.isTabletPortrait;

  protected choiceData$ = this.globalService.choiceData$;
  protected analysis: Analysis | undefined = undefined;

  protected choiceStrings = this.globalService.choiceValues;

  protected currentStar = 0;

  constructor() {
    this.choiceData$
      .pipe(takeUntilDestroyed())
      .subscribe(async choiceData => {
        console.log(choiceData);
        this.analysis = await this.globalService.getAnalysis(choiceData);
        console.log(this.analysis);
      });
  }

  protected onRate(rating: number) {
    const url = `//www.privacy-friendly-business.com/feedback?rating=${rating}`;
    let handle = window.open(url, '_blank');
    if (!handle) {
      console.error("Blocked");
      this.router.navigateByUrl(url);
    }
  }
}
