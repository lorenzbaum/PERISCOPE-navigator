import {Component, inject, OnInit} from '@angular/core';
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
            timer(1200).subscribe(async () => {
              this.analysis = await this.globalService.getAnalysis();
              console.log(this.analysis);
            });
          });
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
}
