import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'ngx-tk-paginator',
  templateUrl: './paginator.component.html',
})
export class PaginatorComponent implements OnInit {

  @Input() total: number;
  @Input() maxPageSize: number;
  @Input() page: number;
  @Input() classes: string[];
  @Output() pageChange: EventEmitter<number> = new EventEmitter<number>();

  first = 1;
  last: number;
  pages: number[];
  pagesNoBounds: number[];

  get hasNext(): boolean {
    return this.page !== this.last;
  }
  get hasPrev(): boolean {
    return this.page !== this.first;
  }
  get moreThan3FromFirst(): boolean {
    return (this.page) > 3;
  }
  get moreThan3FromLast(): boolean {
    return (this.last - this.page) >= 3;
  }

  ngOnInit(): void {
    if (!this.total) {
      console.warn('you must set total number of items input property');
    }
    if (!this.maxPageSize) {
      console.warn('you must set maxPageSize input property');
    }
    if (this.total && this.maxPageSize) {
      this.last = Math.ceil(this.total / this.maxPageSize);
    }
    this.pages = Array(this.last).fill(1).map((x, i) => (i + 1));
    this.pagesNoBounds = this.last > 1 ? this.pages.slice(1).slice(0, -1) : [];
  }

  setPage(pageNumber: number): void {
    this.page = pageNumber;
    this.pageChange.emit(this.page);
  }

  showPageNumber(pageNumber: number): boolean {
    return this.isCurrent(pageNumber) ||
      this.last <= 6 ||
      (this.last > 6 &&
        ((!this.moreThan3FromFirst && this.isLessDistantFromFirst(pageNumber, 3)) ||
          (this.moreThan3FromFirst && this.moreThan3FromLast && this.isDistantFromPage(pageNumber, 1)) ||
          (this.moreThan3FromFirst && !this.moreThan3FromLast && this.isLessDistantFromLast(pageNumber, 3)))
      );
  }

  isCurrent(pageNumber: number): boolean {
    return pageNumber === this.page;
  }

  next(): void {
    if (this.hasNext) {
      this.setPage(this.page + 1);
    }
  }

  prev(): void {
    if (this.hasPrev) {
      this.setPage(this.page - 1);
    }
  }

  private isLessDistantFromLast(pageNumber: number, distance: number): boolean {
    return Math.abs(this.last - pageNumber) <= distance;
  }

  private isLessDistantFromFirst(pageNumber: number, distance: number): boolean {
    return Math.abs(pageNumber - this.first) <= distance;
  }

  private isDistantFromPage(pageNumber: number, distance: number): boolean {
    return Math.abs(this.page - pageNumber) === distance;
  }

}
