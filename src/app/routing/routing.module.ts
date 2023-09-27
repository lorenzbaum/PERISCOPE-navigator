import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CommonModule} from '@angular/common';

import {WelcomeComponent} from "../welcome/welcome.component";
import {FormComponent} from '../form/form.component';
import {DashboardComponent} from '../dashboard/dashboard.component';
import {TableComponent} from '../table/table.component';

const routes: Routes = [
  {path: '', component: WelcomeComponent}, // , title: 'Form'
  {path: 'navigator', component: FormComponent},
  {path: 'results', component: DashboardComponent},
  {path: 'table', component: TableComponent},
  {path: '**', redirectTo: ''},
];

@NgModule({
  declarations: [],
  imports: [
    RouterModule.forRoot(routes),
    CommonModule
  ],
  exports: [RouterModule]
})
export class RoutingModule {
}
