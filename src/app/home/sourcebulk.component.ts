// ------------------------------------------------------------------------------
// ----- sourcebulk.component.ts -----------------------------------------------
// ------------------------------------------------------------------------------

// copyright:   2017 WiM - USGS
// authors:  Tonia Roddick - USGS Wisconsin Internet Mapping
// purpose: selector component for source bulk upload tab in home page

import { Component, OnInit, ViewChild, ChangeDetectorRef, Input } from '@angular/core';

import { WateruseService } from "app/shared/services/wateruse.service";
import { ActivatedRoute } from "@angular/router";
import { ISource } from "app/shared/interfaces/Source.interface";
import { HomeService } from "app/home/home.service";
import { ISourceType } from "app/shared/interfaces/SourceType.interface";
import { ICategoryType } from "app/shared/interfaces/Category.interface";
import * as Handsontable from 'handsontable';
import { HotTable } from 'ng2-handsontable';
import { ToasterService } from "angular2-toaster/angular2-toaster";
import { InfoModal } from "app/shared/modals/info.modal";

@Component({
  selector: 'sourcebulk',
  template: `<p>
                Copy (ctrl+c) source data from your spreadsheet and paste (ctrl+v) into the table below.<br/>
                Required fields are denoted with a *. <b>Facility Codes</b> must start with 'FC'.<br/>
                The table is sortable by clicking on the header column name. Click Validate Table to ensure proper data formatting before uploading the time series data.
            </p>
            <p><button [disabled]="SourceInvalids.length >= 1" type="button" (click)="submitTable()">Upload</button></p>
            <hotTable [data]="sourcedata"
                [colHeaders]="ScolHeaders" [columns]="Scolumns" [options]="StableOptions" [colWidths]="ScolWidths">
            </hotTable>
            <infoModal #info></infoModal>`
})

export class SourceBulkComponent {
    @ViewChild(HotTable) hotSourceTable;
    @ViewChild('info') infomodal: InfoModal;
    @Input() regionId: number;
    public sourcedata: Array<ISource>; // bulk upload 
    public hot: any;
    public SinvalidTable: boolean;
    private ScolHeaders: Array<string>;
    private Scolumns: Array<any>;
    private ScolWidths: Array<number>;
    private StableOptions: any;
    private SourceInvalids: Array<any>;
    public sourceTypeList: Array<ISourceType>; public sourceTypeNameArray: Array<string>;
    public categoryTypeList: Array<ICategoryType>; public categoryTypeNameArray: Array<string>;
    public errorMessage: string;

    constructor(private _homeService: HomeService,private _waterService: WateruseService, private _cdRef:ChangeDetectorRef, 
        private _toastService: ToasterService ){}

    ngOnInit(){
        this._homeService.setInvalidTable(false);
        this._homeService.validTableVal.subscribe((i:boolean) => {
            this.SinvalidTable = i;
        });
        // get the sourcetypes
        this._waterService.sourcetypes().subscribe((st: Array<ISourceType>) => {
            this.sourceTypeList = st;
            this.sourceTypeNameArray = [];
            st.forEach((stype: ISourceType) =>{
                this.sourceTypeNameArray.push(stype.name);
            });                        
        });
        // get the categorytypes
        this._waterService.categorytypes().subscribe((ct: Array<ICategoryType>) => {
            this.categoryTypeList = ct;
            this.categoryTypeNameArray = [];
            ct.forEach((ctype: ISourceType) =>{
                this.categoryTypeNameArray.push(ctype.name);
            });
        });
        this.SourceInvalids = [];
        this.sourcedata = [];
        this.ScolHeaders = ['Facility Name *', 'Facility Code *', 'Source Name', 'Source Type *', 'Category Type', 'Latitude *', 'Longitude *'];
         /*   '<span title="Required">Facility Name <span style="color:#de5030">*</span>', 
            '<span title="Required">Facility Code <span style="color:#de5030">*</span>', 
            'Source Name',
            '<span title="Required">Source Type <span style="color:#de5030">*</span>', 
            'Category Type', 'Station ID',
            '<span title="Required">Location Latitude <span style="color:#de5030">*</span>',
            '<span title="Required">Location Longitude <span style="color:#de5030">*</span>' ];*/
        this.ScolWidths = [120, 120, 120, 160, 160, 120, 120, 120];
        this.Scolumns = [
            { data: 'facilityName', validator: this.reqValidator}, 
            { data: 'facilityCode', validator: this.facCodeValidator },
            { data: 'name'}, 
            { data: 'sourceTypeID', type: 'autocomplete', source: this.sourceTypeNameArray, strict: true}, 
            { data: 'categoryTypeID', type: 'autocomplete', source: this.categoryTypeNameArray, strict: true}, 
            { data: 'stationID' },
            { data: 'location.y', type: 'numeric', /*validator: (value, callback) =>{ 
                let row = this['row']; let col = this['col'];
                let dataAtRow = this['instance'].getDataAtRow(row);
                let otherDataInRow = false;
                dataAtRow.forEach((d, index) => {
                    //need the col too because right after removing req value, it's still in the .getDataAtRow..
                    if (d !== null && d !== "" && index !== col)
                        otherDataInRow = true;
                });
                
                if (((value < 22 || value > 55) || isNaN(value))){//  && otherDataInRow) {
                    setTimeout(()=> { this['instance'].deselectCell(); }, 100);    
                    alert("Latitude must be between 22.0 and 55.0 (dec deg).");                             
                    // this._toastService.pop('warning', 'Warning', 'Latitude must be between 22.0 and 55.0 (dec deg)')
                    callback(false);
                } else if (!value && otherDataInRow) {
                    let whichOne = this['instance'].getColHeader(col);
                    alert("Latitude is required.");
                    // this._toastService.pop('warning', 'Warning', 'Latitude is required')           
                    callback(false);
                } else {
                    callback(true);
                }
            }},*/ format: '0,0.00[0000]'},
            { data: 'location.x', type: 'numeric', format: '0,0.00[0000]'}
        ];
        
        this.StableOptions = { 
            columnSorting: true, 
            minSpareRows: 30, 
            manualColumnResize: true, 
            afterValidate: (isValid, value, row, prop, source) => {
                if (!isValid)  {
                    this.SourceInvalids.push({ "isValid": isValid, "row": row, "prop": prop });
                }
                    
                if (isValid) {
                    let vIndex = -1;
                    for (let vI = 0; vI < this.SourceInvalids.length; vI++) {
                        if (this.SourceInvalids[vI].row == row && this.SourceInvalids[vI].prop == prop) {
                            vIndex = vI;
                            break;
                        }
                    }
                    if (vIndex > -1)
                        this.SourceInvalids.splice(vIndex, 1);
                }
                if (this.SourceInvalids.length > 0) {
                    this._homeService.setInvalidTable(true);
                    this._cdRef.detectChanges();
                }
                else {
                    this._homeService.setInvalidTable(false);
                    this._cdRef.detectChanges();
                }
            } // end afterValidate
        };

    } // end ngOnInit()

    // Validators (TODO) for bulk source table //////////////////////////////////////////////////////////    
    private finishMatchingDD(prop: string): boolean {
        let isItGood: boolean = true;
        switch(prop){
            case 'SourceTypeID':
                //loop thru list of sources and make sure name matches
        }
        return isItGood;
    }
    private matchingDropDownVal(value, callback){
        let returnBool: boolean = true;
        if (value !== "" && value !== null) {
            let prop = this['prop'];
            returnBool = this.finishMatchingDD(prop);
        }
        return returnBool;
    }
    // latitude is required and should be within range
    private latValidator (value, callback) {
        let row = this['row']; let col = this['col'];
        let dataAtRow = this['instance'].getDataAtRow(row);
        let otherDataInRow = false;
        dataAtRow.forEach((d, index) => {
            //need the col too because right after removing req value, it's still in the .getDataAtRow..
            if (d !== null && d !== "" && index !== col)
                otherDataInRow = true;
        });
        
        if (((value < 22 || value > 55) || isNaN(value))){//  && otherDataInRow) {
            setTimeout(()=> { this['instance'].deselectCell(); }, 100);    
            alert("Latitude must be between 22.0 and 55.0 (dec deg).");                             
            // this._toastService.pop('warning', 'Warning', 'Latitude must be between 22.0 and 55.0 (dec deg)')
            callback(false);
        } else if (!value && otherDataInRow) {
            let whichOne = this['instance'].getColHeader(col);
            alert("Latitude is required.");
            // this._toastService.pop('warning', 'Warning', 'Latitude is required')           
            callback(false);
        } else {
            callback(true);
        }
    }
    // longitude is required and should be within range
    public longValidator(value,callback){
        let row = this['row']; let col = this['col'];
        let dataAtRow = this['instance'].getDataAtRow(row);
        let otherDataInRow = false;
        dataAtRow.forEach((d, index) => {
            //need the col too because right after removing req value, it's still in the .getDataAtRow..
            if (d !== null && d !== "" && index !== col)
                otherDataInRow = true;
        });
        if (((value < -130 || value > -55) || isNaN(value))){// && otherDataInRow) {
            setTimeout(()=> { this['instance'].deselectCell(); }, 100);    
            alert("Longitude must be between -130.0 and -55.0 (dec deg).");
            // this._toastService.pop('warning', 'Warning', 'Longitude must be between -130.0 and -55.0 (dec deg)')                              
            callback(false);
        } else if (!value && otherDataInRow) {
            alert("Longitude is a required field.");
            // this._toastService.pop('warning', 'Warning', 'Longitude is a required field')  
            callback(false);
        }
        else {
            callback(true);
        }    
    }
    // validator for required 
    public reqValidator(value, callback){
        if (value == "") callback(false);
        else callback(true);
    }
    // validator on facility code starting with 'FC'
    public facCodeValidator(value, callback) {
        if (value == "") callback(false);
        else if (/^FC/.test(value)) callback(true);
        else callback(false);        
    }
    // End Validators (TODO) for bulk source table //////////////////////////////////////////////////////////    

    // post sources batch  (NOT WORKING YET)
    public submitTable(){        
        // for each one, add unitTypeID: 1 and pass the regionID
        let pastedSources:Array<ISource> =  Object.assign([], this.sourcedata);
        // drop the last 30 since they are empty
        for (var i = pastedSources.length; i--;) {
            if (pastedSources[i].facilityCode === undefined || pastedSources[i].facilityCode === null || pastedSources[i].facilityCode === "") {
                pastedSources.splice(i, 1);
            } else {
                //add the regionID, srid, 
                pastedSources[i].regionID = this.regionId;
                pastedSources[i]['location'].srid = 4269;
            }
        }
        let test = 'wht';
        if (pastedSources.length > 0){
            this._waterService.postBatchSources(this.regionId, pastedSources).subscribe(
                response => {
                    let well = response;
                    this._toastService.pop('success', 'Success', 'Sources uploaded.');
                    this.sourcedata = [];
                }, error => {
                    this.errorMessage = error;
                    this._toastService.pop('error', 'Error', 'Sources was not uploaded.');
                }
            );
        } else {
            let infoMessage = "You must first add sources data before clicking upload."
            this.infomodal.showInfoModal(infoMessage);
        }            
        
    }    
}