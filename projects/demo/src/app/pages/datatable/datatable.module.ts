import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DatatableModule as DTModule } from '../../../../../ngx-toolkit/datatable/src/public-api';
import { DatatableComponent } from './components/datatable/datatable.component';


@NgModule({
  declarations: [DatatableComponent],
  imports: [
    CommonModule,
    DTModule,
    RouterModule.forChild([
      {
        path: '',
        component: DatatableComponent
      }
    ])
  ]
})
export class DatatableModule { }
