import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { getPropByString } from 'projects/ngx-toolkit/shared/src/lib/helpers/utils';
import { IDatatableConfig, IDatatablePagination } from '../../types/config';
import { IDataTable } from '../../types/datatable';

@Component({
  selector: 'ngx-tk-datatable',
  templateUrl: './datatable.component.html',
  styleUrls: ['./datatable.component.scss']
})
export class DatatableComponent implements OnChanges, OnInit {

  @Input() data: IDataTable[] | null = [];
  @Input() config: IDatatableConfig | null = null;
  @Output() selection = new EventEmitter<IDataTable>();
  headings: string[] = [];
  orderBy: { column: string, sort: 'asc' | 'desc' } = null;
  currentPage = 0;
  sliceStart = 0;
  sliceEnd: number;
  pagination: IDatatablePagination;

  constructor() { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.data) {
      const { currentValue, previousValue } = changes.data;
      if (currentValue !== previousValue && currentValue !== null) {
        this.headings = this.getHeadings(currentValue[0]);
      }
    }
  }

  ngOnInit(): void {
    this.pagination = this.config.pagination;
    this.getPageData(this.pagination.startPage);
  }

  getProp(obj: any, prop: string): any {
    return getPropByString(obj, prop);
  }

  /**
   * extract and sort headings by config properties
   * @param data single object from array of data
   * @returns array of headings
   */
  getHeadings(data: any): string[] {
    const headings = Object.keys(data);
    const props = this.config?.properties;
    if (props && props?.length > 0) {
      return headings
        .filter(heading => props?.includes(heading))
        .sort((a, b) => props.indexOf(a) - props.indexOf(b));
    }
    return headings;
  }

  selectAll(ev: EventTarget | any): void {
    this.data.forEach(datum => datum.checked = ev.checked);
  }

  selectedClass(column: string): string {
    let styles = '';
    styles = 'arrow ml-2';
    if (column === this.orderBy?.column) {
      return `${this.orderBy.sort === 'asc' ? 'up' : 'down'}  ${styles}`;
    } else {
      return styles;
    }
  }

  changeSorting(column: string): void {
    this.orderBy = {
      column,
      sort: !this.orderBy?.sort || this.orderBy?.sort === 'asc' ? 'desc' : 'asc'
    };
  }

  pageChange(page: number): void {
    if (page < 1 || page > this.data.length) {
      return;
    }
    this.getPageData(page);
  }

  getPageData(page: number): void {
    this.currentPage = page === 0 ? 1 : page;
    this.sliceStart = (this.currentPage - 1) * this.pagination.maxPageSize;
    this.sliceEnd = this.sliceStart + this.pagination.maxPageSize;
  }
}
