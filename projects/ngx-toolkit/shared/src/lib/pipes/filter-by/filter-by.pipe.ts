import { Pipe, PipeTransform } from '@angular/core';
import { getPropByString } from '../../helpers/utils';

/**
 * filter arrays by operator and filter term.
 *
 * can filter by
 * property eg: someArray | filter : 'prop1' : '===' : filterTerm
 * multiple properties eg: someArray | filter : 'prop1 | prop2' : '===' : filterTerm
 * deep property eg: someArray | filter : 'prop1.prop2' : '===' : filterTerm
 * nested array eg: someArray | filter : ['prop1', 'prop2'] : '===' : filterTerm
 *
 * first param is a string or array of properties to filter by
 * second param is the filter term to filter by
 * third param is an operator; default indexOf for partial string comparison
 */
@Pipe({
  name: 'filterBy'
})
export class FilterByPipe implements PipeTransform {

  transform<T>(value: T[], props: string | string[], filterTerm: string, operator: Operators = 'indexOf'): T[] {

    if (filterTerm) {
      if (typeof props === 'string') {
        const propArr = props.replace(/\s/g, '').split('|');
        return value.filter(item => propArr.some(prop => this.filterProps(getPropByString(item, prop), filterTerm, operator)));
      } else {
        return value.filter((item) => {
          return this.reducefn(item, props, filterTerm, operator);
        });
      }
    }
    return value;
  }

  reducefn<T>(value: T, props: string[], term: string, operator: Operators): string {
    return props.reduceRight((acc, entry) => {
      if (value[entry] && value[entry].length > 0) {
        return value[entry]
          .some((item: { [x: string]: any; }) =>
            this.filterProps(item[acc], term, operator)
          );
      }
    });
  }

  filterProps(item: any, term: string, operator: Operators): boolean {
    if (item) {
      switch (operator) {
        case '!==':
          return item !== term;
        case '===':
          return item === term;
        case '>':
          return item > term;
        case '<':
          return item < term;
        case '>=':
          return item >= term;
        case '<=':
          return item <= term;
        default:
          return item.toLowerCase().indexOf(term.toLowerCase()) > -1;
      }
    }
    return false;
  }

}

type Operators = '>' | '<' | '===' | 'indexOf' | '!==' | '>=' | '<=';
