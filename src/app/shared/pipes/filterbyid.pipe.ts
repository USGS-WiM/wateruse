import { Injectable, Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'filterbyid'
})

@Injectable()
export class IdFilterPipe implements PipeTransform {    
    transform(items: any, filter: any): any {
        if (filter.id !== undefined) {
            if (filter && Array.isArray(items)) {
                let filterKeys = Object.keys(filter);
                return items.filter(item =>
                    filterKeys.reduce((memo, keyName) =>
                        (memo && new RegExp(filter[keyName], 'gi').test(item[keyName])) || filter[keyName] === "", true));
            } else {
                return items;
            }
        }
    }
}