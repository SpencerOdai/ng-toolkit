import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FilterByPipe } from './pipes/filter-by/filter-by.pipe';
import { GroupByPipe } from './pipes/group-by/group-by.pipe';
import { SortByPipe } from './pipes/sort-by/sort-by.pipe';

const PIPES = [
  FilterByPipe, SortByPipe, GroupByPipe
];

@NgModule({
  declarations: [PIPES],
  imports: [
    CommonModule
  ],
  exports: [PIPES]
})
export class SharedModule { }
