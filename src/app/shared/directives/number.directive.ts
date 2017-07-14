// ------------------------------------------------------------------------------
// ----- number.directive.ts -----------------------------------------------
// ------------------------------------------------------------------------------

// copyright:   2017 WiM - USGS
// authors:  Tonia Roddick - USGS Wisconsin Internet Mapping
// purpose: directive to ensure input is a number only with optional negative sign

import { Directive } from "@angular/core";
import { NgControl } from "@angular/forms";

@Directive({
    selector: '[numberformat]', 
    host: {
    '(ngModelChange)': 'onInputChange($event)',
    '(keydown.backspace)': 'onInputChange($event.target.value, true)'
  }
})

export class numberFormat {
    public newVal: any;

    constructor(public model: NgControl) {}

    onInputChange(event, backspace) {
        this.newVal = event;

        if (backspace) {
            this.newVal = this.newVal.substring(0, this.newVal.length - 1);
        } 
        // remove all mask characters (keep only numeric)
        if (event != null) {
            //let reg = /(?!^-)[0-9]?[0-9][\.][0-9]/g;
            let reg = /(?!^-)[^0-9\.]/g;
            //this.newVal = event ? event.replace(reg, '') : null;
            this.newVal = event ? event.replace(reg, '').replace(/\./, "x").replace(/\./g, "").replace(/x/, "."): null;
//            this.newVal = event ? event.replace(/(?!^-)[^0-9\.]/g, ''): null;

            // set the new value
            this.model.valueAccessor.writeValue(this.newVal);       
        }
    }
}