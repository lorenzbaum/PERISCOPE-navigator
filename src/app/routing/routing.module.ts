import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule, Routes} from "@angular/router";
import {WelcomeComponent} from "../welcome/welcome.component";
import {FormComponent} from '../form/form.component';
import {DashboardComponent} from '../dashboard/dashboard.component';
import {TableComponent} from '../table/table.component';

const routes: Routes = [
  {path: ``, component: WelcomeComponent}, // , title: 'Form'
  {path: $localize`:routing:navigator`, component: FormComponent},
  {path: $localize`:routing:results`, component: DashboardComponent},
  {path: `table`, component: TableComponent},
  {path: `**`, redirectTo: ''},
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forRoot(routes, {bindToComponentInputs: true}),
  ],
  exports: [RouterModule]
})
export class RoutingModule {
}
