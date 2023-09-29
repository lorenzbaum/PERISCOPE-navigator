import {Component, inject, OnInit} from '@angular/core';
import {Breakpoints, BreakpointObserver} from '@angular/cdk/layout';
import {map} from 'rxjs/operators';
import {GlobalService} from "../global.service";
import {Router} from "@angular/router";
import {timer} from "rxjs";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
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

  protected formData$ = this.globalService.formData$;
  protected analysis: object | undefined = undefined;

  ngOnInit() {
    if (!this.globalService.formData) {
      console.warn('No form data received!');
      this.router.navigate(['/']).then(() => console.log('Navigated to /...'));
    } else {
      this.formData$.subscribe(formData => {
        timer(2400).subscribe(() => this.analysis = {}); // this.globalService.analyze(formData););
      });
    }
  }
}
