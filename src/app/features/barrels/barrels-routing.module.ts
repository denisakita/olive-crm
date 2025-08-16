import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BarrelsComponent } from './barrels.component';

const routes: Routes = [
  {
    path: '',
    component: BarrelsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BarrelsRoutingModule { }