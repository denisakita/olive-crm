import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BottlesComponent } from './bottles.component';

const routes: Routes = [
  {
    path: '',
    component: BottlesComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BottlesRoutingModule { }