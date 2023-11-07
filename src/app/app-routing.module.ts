import {inject, Injectable, NgModule} from '@angular/core';
import {RouterModule, RouterStateSnapshot, Routes, TitleStrategy} from "@angular/router";
import {HomeComponent} from "./home/home.component";
import {RecommenderComponent} from './recommender/recommender.component';
import {ResultsComponent} from './results/results.component';
import {Title} from "@angular/platform-browser";
import {GlobalService} from "./global.service";


@Injectable()
export class TemplatePageTitleStrategy extends TitleStrategy {
  private readonly titleService = inject(Title);
  private readonly baseTitle = inject(GlobalService).title;

  constructor() {
    super();
  }

  override updateTitle(routerState: RouterStateSnapshot) {
    const title = this.buildTitle(routerState);
    if (title) {
      this.titleService.setTitle(`${title} | ${this.baseTitle}`);
    } else {
      this.titleService.setTitle(`${this.baseTitle}`);
    }
  }
}


const routes: Routes = [
  {path: ``, component: HomeComponent, title: $localize`:title|home:`},
  {path: $localize`:routing:recommender`, component: RecommenderComponent, title: $localize`:title:Recommender`},
  {path: $localize`:routing:results`, component: ResultsComponent, title: $localize`:title:Results`},
  {path: `**`, redirectTo: ''},
];


@NgModule({
  declarations: [],
  imports: [
    RouterModule.forRoot(routes, {bindToComponentInputs: true}),
  ],
  exports: [RouterModule],
  providers: [{
    provide: TitleStrategy,
    useClass: TemplatePageTitleStrategy
  }],
})
export class AppRoutingModule {
}
