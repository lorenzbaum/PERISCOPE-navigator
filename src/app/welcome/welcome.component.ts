import {Component, inject} from '@angular/core';
import {GlobalService} from "../global.service";
import {BreakpointObserver, Breakpoints} from "@angular/cdk/layout";
import {Observable} from "rxjs";
import {map, shareReplay} from "rxjs/operators";

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent {
  private breakpointObserver = inject(BreakpointObserver);
  private globalService = inject(GlobalService);

  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe([Breakpoints.Handset, Breakpoints.TabletPortrait, Breakpoints.WebPortrait])
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  protected readonly version = this.globalService.version;
  protected readonly title = this.globalService.title;
}
