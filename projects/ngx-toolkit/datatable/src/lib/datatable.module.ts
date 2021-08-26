import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { PaginatorModule } from 'projects/ngx-toolkit/paginator/src/public-api';
import { SharedModule } from 'projects/ngx-toolkit/shared/src/public-api';
import { DatatableComponent } from './components/datatable/datatable.component';



@NgModule({
  declarations: [DatatableComponent],
  imports: [
    CommonModule,
    PaginatorModule,
    SharedModule
  ],
  exports: [DatatableComponent]
})
export class DatatableModule { }
