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
                let filt = items.filter(function(x) {
                    return x.id == filter.id
                })
                return filt
            } else {
                return items;
            }
        }
    }
}