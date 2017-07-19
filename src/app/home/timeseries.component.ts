// ------------------------------------------------------------------------------
// ----- timeseries.component.ts -----------------------------------------------
// ------------------------------------------------------------------------------

// copyright:   2017 WiM - USGS
// authors:  Tonia Roddick - USGS Wisconsin Internet Mapping
// purpose: selector component for timeseries tab in home page

import { Component, ViewChild, Output, EventEmitter, Input, ChangeDetectorRef } from '@angular/core';
import { HomeService } from "app/home/home.service";
import { WateruseService } from "app/shared/services/wateruse.service";
import { ToasterService } from "angular2-toaster/angular2-toaster";
import { ITimeseries } from "app/shared/interfaces/Timeseries.interface";
import * as Handsontable from 'handsontable';
import { HotTable } from 'ng2-handsontable';
import { InfoModal } from "app/shared/modals/info.modal";

@Component({
  selector: 'timeseries',
  template: `<p>
                Copy (ctrl+c) time series data from your spreadsheet and paste (ctrl+v) into the table below.<br/>
                All <b>dates</b> will be saved as the first of the month (ex: 'MM/01/YYYY') <b>Facility Codes</b> must start with 'FC'.<br/>
                The table is sortable by clicking on the header column name.
            </p>
            <p><button [disabled]="invalids.length >= 1" type="button" (click)="submitTable()">Upload</button></p>
            <hotTable [data]="timeseriesdata"
                [colHeaders]="colHeaders" [columns]="columns" [options]="tableOptions" [colWidths]="colWidths">
            </hotTable>
            <infoModal #info></infoModal>`
})

export class TimeseriesComponent {
    @ViewChild(HotTable) hotTable;
    @Input() regionId: number;
    @ViewChild('info') infomodal: InfoModal;
    public timeseriesdata: Array<ITimeseries>; // bulk upload timeseries data
    public hot: any;
    public invalidTable: boolean;
    private colHeaders: Array<string>;
    private columns: Array<any>;
    private colWidths: Array<number>;
    private tableOptions: any;
    private invalids: Array<any>;
    public errorMessage: string;
    public infoMessage: string; // message to show in info modal

    constructor(private _waterService: WateruseService, private _homeService: HomeService, private _cdRef:ChangeDetectorRef, 
        private _toastService: ToasterService) {}

    ngOnInit(){
        this._homeService.setInvalidTable(false);
        this._homeService.validTableVal.subscribe((i:boolean) => {
            this.invalidTable = i;
        });
        this.invalids = [];
        this.timeseriesdata = [];
        this.colHeaders = ['Facility Code', 'Date', 'Value'];
        this.colWidths = [120, 120, 120];
        this.columns = [
            { data: 'FacilityCode', validator: this.facCodeValidator },
            { data: 'Date', type: 'date', dateFormat: 'MM/DD/YYYY', correctFormat: true },
            { data: 'Value', type: 'numeric', format: '0,0.00[0000]' }
        ];//stretchH: 'all',*/
        this.tableOptions = { 
            columnSorting: true, 
            minSpareRows: 30, 
            manualColumnResize: true, 
            afterValidate: (isValid, value, row, prop, source) => {
                if (!isValid)  {
                    this.invalids.push({ "isValid": isValid, "row": row, "prop": prop });
                }
                    
                if (isValid) {
                    let vIndex = -1;
                    for (let vI = 0; vI < this.invalids.length; vI++) {
                        if (this.invalids[vI].row == row && this.invalids[vI].prop == prop) {
                            vIndex = vI;
                            break;
                        }
                    }
                    if (vIndex > -1)
                        this.invalids.splice(vIndex, 1);
                }
                if (this.invalids.length > 0) {
                    this._homeService.setInvalidTable(true);
                    this._cdRef.detectChanges();
                }
                else {
                    this._homeService.setInvalidTable(false);
                    this._cdRef.detectChanges();
                }
            } // end afterValidate
        };
    }
    // validator on facility code starting with 'FC'
    public facCodeValidator(value, callback) {
        if (value == "") callback(true);
        else if (/^FC/.test(value)) callback(true);
        else callback(false);        
    }

    // post timeseries batch
    public submitTable(){        
        // for each one, add unitTypeID: 1 and pass the regionID
        let pastedTimes =  Object.assign([], this.timeseriesdata);
        // drop the last 30 since they are empty
        for (var i = pastedTimes.length; i--;) {
            if (pastedTimes[i].FacilityCode === undefined || pastedTimes[i].FacilityCode === null || pastedTimes[i].FacilityCode === "") {
                pastedTimes.splice(i, 1);
            } else {
                //add the unitTypeID
                pastedTimes[i].UnitTypeID = 1;
            }
        }
        let test = 'wht';
        if (pastedTimes.length > 0){
            this._waterService.postBatchTimeseries(this.regionId, pastedTimes).subscribe(
                response => {
                    let well = response;
                    this._toastService.pop('success', 'Success', 'Timeseries uploaded.');
                    this.timeseriesdata = [];
                }, error => {
                    this.errorMessage = error;
                    this._toastService.pop('error', 'Error', 'Timeseries was not uploaded.');
                }
            );
        } else {
            this.infoMessage = "You must first add timeseries data before clicking upload."
            this.infomodal.showInfoModal(this.infoMessage);
        }                    
    }    

    private afterOnCellMouseDown(e: any) {
        console.log(e);
    }
    // END TIMESERIES SECTION ////////////////////////////////////////////////////////////

}