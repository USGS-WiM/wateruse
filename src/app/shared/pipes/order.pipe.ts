// ------------------------------------------------------------------------------
// ----- order.pipe.ts -----------------------------------------------
// ------------------------------------------------------------------------------

// copyright:   2017 WiM - USGS
// authors:  Tonia Roddick - USGS Wisconsin Internet Mapping
// purpose: pipe to sort a given array by the property field provided (args)

import { Pipe } from "@angular/core";

@Pipe({
  name: "sort"
})
export class ArraySortPipe {
  transform(array: Array<string>, args: string): Array<string> {
    array.sort((a: any, b: any) => {
      if (a[args].toLowerCase() < b[args].toLowerCase()) {
        return -1;
      } else if (a[args].toLowerCase() > b[args].toLowerCase()) {
        return 1;
      } else {
        return 0;
      }
    });
    return array;
  }
}