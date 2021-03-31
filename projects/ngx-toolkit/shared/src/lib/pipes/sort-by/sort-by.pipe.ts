import { Pipe, PipeTransform } from '@angular/core';
import { getPropByString } from '../../helpers/utils';

@Pipe({
  name: 'sortBy'
})
export class SortByPipe implements PipeTransform {

  transform<T>(value: T[], propName?: string, order: 'asc' | 'desc' = 'desc', customSortOrder?: { [key: string]: number }): T[] {
    let sorted: T[];

    if (value && value.length > 0) {
      sorted = value.sort((a: T, b: T) => {
        if (customSortOrder) {
          return this.sortOrder(customSortOrder, a, b, propName);
        } else {
          return this.getPropValue(a, propName) > this.getPropValue(b, propName) ? -1 : 1;
        }
      });
      return order === 'asc' ? sorted : sorted.reverse();
    }
    return value;
  }

  sortOrder(sortOrder: { [key: string]: number }, a: any, b: any, propName?: string): number {
    let aVal: number; let bVal: number;
    if (propName) {
      aVal = sortOrder[getPropByString(a, propName)];
      bVal = sortOrder[getPropByString(b, propName)];
    } else {
      aVal = sortOrder[a];
      bVal = sortOrder[b];
    }
    return (aVal || sortOrder.default) - (bVal || sortOrder.default);
  }

  getPropValue(obj: any, propName: string): unknown {
    let value = propName ? getPropByString(obj, propName) : obj;

    if (typeof value === 'string') {
      value = value.toLowerCase();
    }
    return value;
  }
}
