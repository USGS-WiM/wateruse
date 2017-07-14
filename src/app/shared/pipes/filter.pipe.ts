// ------------------------------------------------------------------------------
// ----- filter.pipe.ts -----------------------------------------------
// ------------------------------------------------------------------------------

// copyright:   2017 WiM - USGS
// authors:  Tonia Roddick - USGS Wisconsin Internet Mapping
// purpose: pipe to filter array of (items) objects and 
//   return the items with the string value (args.filterValue) present in the property field (args.filterProperty) provided

import { Pipe, PipeTransform } from '@angular/core';
import { ISource } from "app/shared/interfaces/Source.interface";

@Pipe({
    name: 'filter',
    pure: false
})

export class FilterPipe implements PipeTransform {    
    transform(items: Array<any>, args: any): Array<any> {
        // args is an object with .filterProperty (which property) .filterValue (the thing to filter by)
        let filterValue = args.filterValue ? args.filterValue.toLocaleLowerCase() : null;

        return filterValue ? items.filter(item => item[args.filterProperty].toLocaleLowerCase().indexOf(filterValue) !== -1) : items;
    }
}
