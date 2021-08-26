import { Pipe, PipeTransform } from '@angular/core';
import nestedGroupby from 'nested-groupby';

@Pipe({
  name: 'groupBy'
})
export class GroupByPipe implements PipeTransform {

  transform<T>(value: T[], keys: string | string[]): { [key: string]: T[] } {
    if (value && value.length > 0) {
      if (typeof keys === 'string') {
        keys = [keys];
      }
      return nestedGroupby(value, keys);
    }
    return {};
  }

}
