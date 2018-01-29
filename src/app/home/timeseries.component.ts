// ------------------------------------------------------------------------------
// ----- timeseries.component.ts -----------------------------------------------
// ------------------------------------------------------------------------------

// copyright:   2017 WiM - USGS
// authors:  Tonia Roddick - USGS Wisconsin Internet Mapping
// purpose: selector component for timeseries tab in home page

import { Component, ViewChild, Output, EventEmitter, Input, ChangeDetectorRef } from '@angular/core';
import { HomeService } from "app/home/home.service";
import { WateruseService } from "app/shared/services/wateruse.service";
import { LoadingService } from "app/shared/services/loading.service";
import { ToasterService } from "angular2-toaster/angular2-toaster";
import { ITimeseries } from "app/shared/interfaces/Timeseries.interface";
import * as Handsontable from 'handsontable';
import { HotTable } from 'ng2-handsontable';
import { InfoModal } from "app/shared/modals/info.modal";

@Component({
  selector: 'timeseries',
  template: `<p>
                Copy (ctrl+c) time series data from your spreadsheet and paste (ctrl+v) into the table below.<br/>
                <b>Required</b> fields are denoted with a *.<br/>
                All <b>Dates</b> will be saved as the first of the month (ex: 'MM/01/YYYY').<br/> 
                <b>Facility Codes</b> must start with 'FC'. The table is sortable by clicking on the header column name.
            </p>
            <p>
                <button [disabled]="isInvalidTable()" type="button" (click)="submitTable()" class="btn-blue">Upload</button>
            </p>
            <hotTable #timeHotTable [data]="timeseriesdata" [colHeaders]="colHeaders" [columns]="columns" [options]="tableOptions" [colWidths]="colWidths"></hotTable>
            <infoModal #info></infoModal>`
})

export class TimeseriesComponent {
    @ViewChild('timeHotTable') hotTable;
    @Input() regionId: number;
    @ViewChild('info') infomodal: InfoModal;
    public timeseriesdata: Array<ITimeseries> = []; // bulk upload timeseries data
    public hot: any;
    public invalidTable: boolean;
    public colHeaders: Array<string>;
    public columns: Array<any>;
    public colWidths: Array<number>;
    public tableOptions: any;
    private invalids: Array<any>;
    public infoMessage: string; // message to show in info modal
    public validTabSubscript: any;

    constructor(private _waterService: WateruseService, private _homeService: HomeService, private _cdRef:ChangeDetectorRef, 
        private _toastService: ToasterService, private _loadingService: LoadingService) {}

    ngOnInit(){
        this._loadingService.setLoading(false);
        this._homeService.setInvalidTSTable(false);
        this.validTabSubscript = this._homeService.validTSTableVal.subscribe((i:boolean) => {
            this.invalidTable = i;
            this._cdRef.detectChanges();
        });
        this.invalids = [];
        this.timeseriesdata = [];
        this.colHeaders = ['Facility Code *', 'Date *', 'Value *'];
        this.colWidths = [120, 120, 120];
        this.columns = [
            { data: 'FacilityCode', validator: this.reqValidator },
            { data: 'Date', type: 'date', dateFormat: 'MM/DD/YYYY', correctFormat: true, validator: this.reqValidator },
            { data: 'Value', type: 'numeric', format: '0,0.00[0000]', validator: this.numberValidator}, 
        ];//stretchH: 'all',*/
        this.tableOptions = { 
            columnSorting: true, 
            rowHeaders: true,
            contextMenu: ['remove_row'],
            minSpareRows: 30, 
            manualColumnResize: true, 
            afterValidate: (isValid, value, row, prop, source) => {
                if (!isValid)  {
                    this.invalids.push({ "isValid": isValid, "row": row, "prop": prop });
                } else {
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
                    this._homeService.setInvalidTSTable(true);
                } else {
                    this._homeService.setInvalidTSTable(false);
                }
            }, // end afterValidate
            afterRemoveRow: (index, amount) => {
                //if any $scope.invalids[i].row == index then splice it out
                let selected = this.hotTable.getHandsontableInstance();//.getSelected(); //[startRow, startCol, endRow, endCol]
                let selectedForRealz = selected.getSelected();
                let test = this;
                if (amount > 1) {
                    //more than 1 row being deleted. 
                    let eachRowIndexArray = []; //holder for array index to loop thru for splicing invalids
                    let cnt = (selected[2] - selected[0] + 1); //gives me count of selected rows
                    eachRowIndexArray.push(selected[0]);
                    for (let c = 1; c < cnt; c++)
                        eachRowIndexArray.push(selected[0] + 1);
                    //loop thru invalids to see if any are in the deleting rows
                    for (let Mi = this.invalids.length; Mi--;) {
                        if (eachRowIndexArray.indexOf(this.invalids[Mi].row) > -1)
                            this.invalids.splice(Mi, 1);
                    }
                } else {
                    //just 1 row selected
                    for (let i = this.invalids.length; i--;) {
                        if (this.invalids[i].row == index)
                            this.invalids.splice(i, 1);
                    }
                }
                if (this.invalids.length > 0) {
                    this._homeService.setInvalidTSTable(true);
                }
                else {
                    this._homeService.setInvalidTSTable(false);
                }
            }
        };        
        //add htInvalid when post response fails with invalid Facility Codes
        this.hotTable.manipulator = {
            colorLine : (line) =>{
                let cell = this.hotTable.getHandsontableInstance().getCell(line, 0);
                cell.attributes[0].value = 'htInvalid';
            }
        };
    } // end ngOnInit

    public isInvalidTable(){
        return this.invalidTable;
    }
    // validator on facility code starting with 'FC'
    private numberValidator (value, callback) {
        let row = this['row']; let col = this['col'];
        let dataAtRow = this['instance'].getDataAtRow(row);
        let otherDataInRow = false;
        dataAtRow.forEach((d, index) => {
            //need the col too because right after removing req value, it's still in the .getDataAtRow..
            if (d !== null && d !== "" && index !== col)
                otherDataInRow = true;
        });        
        if ((isNaN(value)) && value !== null) {
            setTimeout(()=> { this['instance'].deselectCell(); }, 100);    
            alert("Value must be a number");                             
            callback(false);
        } else if (!value && otherDataInRow) {
            setTimeout(()=> { this['instance'].deselectCell(); }, 100);  
            alert("Value is required.");        
            callback(false);
        } else {
            callback(true);
        }
    }
    
    // validator for required 
    public reqValidator(value, callback){
        let dataAtRow = this['instance'].getDataAtRow(this['row']); // get this row's data
        let otherDataInRow = false; //flag for if other data exist at this row
        dataAtRow.forEach((d, index) => {
            //need the col too because right after removing req value, it's still in the .getDataAtRow..
            if (d !== null && d !== "" && index !== this['col'])
                otherDataInRow = true;
        });
        if ((value == "" || value == null) && otherDataInRow) 
            callback(false);        
        else callback(true);
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
        if (pastedTimes.length > 0){
            this.hotTable.getHandsontableInstance().validateCells((valid) => {
                if (valid) { 
                    this._loadingService.setLoading(true);
                    this._waterService.postBatchTimeseries(this.regionId, pastedTimes)
                        .subscribe(response => {
                            this._loadingService.setLoading(false);
                            this._toastService.pop('success', 'Success', 'Timeseries uploaded.');
                            this.timeseriesdata = [];
                        }, error => { 
                            this._loadingService.setLoading(false);
                            for(let key in error._body) {
                                this.hotTable.manipulator.colorLine(Number(key));
                            }
                            this._toastService.pop('error', 'Error', 'Invalid Facility Code(s).');                    
                        });
                } //end if valid
            }); // end validateCells
        } else {           
                this.infoMessage = "You must first add timeseries data before clicking upload."
                this.infomodal.showInfoModal(this.infoMessage);
        }
    }    
    
    ngOnDestroy() {
        this.validTabSubscript.unsubscribe()
        this._cdRef.detach(); // try this
    }

}