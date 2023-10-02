import {Component, inject, OnInit} from '@angular/core';
import {Breakpoints, BreakpointObserver} from '@angular/cdk/layout';
import {map} from 'rxjs/operators';
import {ChoiceValues, GlobalService, NavigatorChoices, NavigatorValues} from "../global.service";
import {Router} from "@angular/router";
import {timer} from "rxjs";

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.css']
})
export class ResultsComponent implements OnInit {
  private breakpointObserver = inject(BreakpointObserver);
  private globalService = inject(GlobalService);
  private router = inject(Router);

  protected cards = this.breakpointObserver.observe(Breakpoints.Handset).pipe(
    map(({matches}) => {
      if (matches) {
        return [
          {title: 'Card 1', cols: 1, rows: 1},
          {title: 'Card 2', cols: 1, rows: 1},
          {title: 'Card 3', cols: 1, rows: 1},
          {title: 'Card 4', cols: 1, rows: 1}
        ];
      }

      return [
        {title: 'Card 1', cols: 2, rows: 1},
        {title: 'Card 2', cols: 1, rows: 1},
        {title: 'Card 3', cols: 1, rows: 2},
        {title: 'Card 4', cols: 1, rows: 1}
      ];
    })
  );

  protected choiceData$ = this.globalService.choiceData$;
  private valueData: NavigatorValues = this.globalService.choiceValues;
  protected analysis: object | undefined = undefined;

  ngOnInit() {
    if (!this.globalService.choiceData) {
      console.warn('No choice data received!');
      this.router.navigate(['/']).then(() => console.log('Navigated to /...'));
    } else {
      this.choiceData$.subscribe(choiceData => {
        timer(2400).subscribe(() => this.analysis = this.analyze(choiceData, this.valueData)); // this.globalService.analyze(choiceData););
      });
    }
  }

  private analyze(choiceData: NavigatorChoices | undefined, valueData: NavigatorValues): { choiceValues: ChoiceValues, sum: number } | undefined {
    if (choiceData) {
      let result: ChoiceValues = {};
      for (let attribute in choiceData) {
        let currentChoice = choiceData[attribute];
        let valueObject = valueData[attribute];
        if (currentChoice && valueObject) {
          if (typeof currentChoice === 'object') { // check boxes
            let currentResult: { [option: string]: number | null } = {};
            for (let option in currentChoice) {
              currentResult[option] = currentChoice[option] && valueObject[option] ? valueObject[option] : null;
            }
            result[attribute] = currentResult;
          } else { // normal select
            result[attribute] = valueObject[currentChoice] ? valueObject[currentChoice] : null;
          }
        } else { // no choice made or possible
          result[attribute] = null;
        }
      }
      let sum = 0;
      for (let attribute in result) {
        let currentResult = result[attribute];
        if (currentResult && typeof currentResult === 'object') {
          let smallest = +Infinity;
          for (let level in currentResult) {
            const current = currentResult[level];
            smallest = current && current < smallest ? current : smallest;
          }
          sum += smallest;
        } else {
          sum += currentResult ? currentResult : 0;
        }
      }
      return { choiceValues: result, sum: sum};
    } else {
      return undefined;
    }
  }
}
