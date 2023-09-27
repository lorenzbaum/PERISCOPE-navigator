import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {FormComponent} from './form/form.component';
import {DashboardComponent} from './dashboard/dashboard.component';
import {TableComponent} from './table/table.component';

const routes: Routes = [
  {path: '', component: FormComponent}, // , title: 'Form'
  {path: 'results', component: DashboardComponent},
  {path: 'table', component: TableComponent},
  {path: '**', redirectTo: ''},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
