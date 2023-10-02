import {Component, inject, OnInit} from '@angular/core';
import {Analysis, GlobalService} from "../global.service";
import {Router} from "@angular/router";
import {timer} from "rxjs";

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.scss']
})
export class ResultsComponent implements OnInit {
  private globalService = inject(GlobalService);
  private router = inject(Router);

  protected isHandset$ = this.globalService.isHandset$;
  protected isTabletPortrait$ = this.globalService.isTabletPortrait$;

  protected choiceData$ = this.globalService.choiceData$;
  protected analysis: Analysis | undefined = undefined;

  ngOnInit() {
    if (!this.globalService.choiceData) {
      console.warn('No choice data received!');
      this.router.navigate(['/']).then(() => console.log('Navigated to /...'));
    } else {
      this.choiceData$.subscribe(choiceData => {
        console.log(choiceData);
        this.analysis = undefined;
        timer(1200).subscribe(async () => {
          this.analysis = await this.globalService.getAnalysis();
          console.log(this.analysis);
        });
      });
    }
  }

  onRate(rating: number) {
    console.log(rating);
  }
}
