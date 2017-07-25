// ------------------------------------------------------------------------------
// ----- sourcebulk.component.ts -----------------------------------------------
// ------------------------------------------------------------------------------

// copyright:   2017 WiM - USGS
// authors:  Tonia Roddick - USGS Wisconsin Internet Mapping
// purpose: selector component for source bulk upload tab in home page

import { Component, OnInit, ViewChild, ChangeDetectorRef, Input, ViewChildren } from '@angular/core';

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
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'sourcebulk',
  template: `
        <ng-container [ngTemplateOutlet]="bulkSource"></ng-container>
        <ng-template #bulkSource let-c="close" let-d="dismiss">  
            <div class="modal-header">
                <h3 class="modal-title">Bulk Source Upload</h3>
            </div>
            <div class="modal-body">
                <p>
                    Copy (ctrl+c) source data from your spreadsheet and paste (ctrl+v) into the table below.<br/>
                    Required fields are denoted with a *. <b>Facility Codes</b> must start with 'FC'.<br/>
                    The table is sortable by clicking on the header column name. Click Validate Table to ensure proper data formatting before uploading the time series data.
                </p>
                
                <hotTable #hotTable [data]="sourcedata"
                    [colHeaders]="ScolHeaders" [columns]="Scolumns" [options]="StableOptions" [colWidths]="ScolWidths">
                </hotTable>                
            </div>
            <div class="modal-footer">
            <button type="button" (click)="testValidate()">Click</button>
                <button *ngIf="!SinvalidTable" type="button" (click)="submitTable()" class="btn-blue">Upload</button>
                <button type="button" (click)="d()" class="btn-black">Cancel</button>
            </div>
        </ng-template>
        <infoModal #info></infoModal>`
})

export class SourceBulkComponent {    
    @ViewChild('bulkSource') public bulkSourceModal; // modal for uploading bulk sources
    private modalElement: any;    
    @ViewChild('info') infomodal: InfoModal;
    @ViewChild('hotTable') hotSourceTable;
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
        private _toastService: ToasterService, private _modalService: NgbModal ){}

    ngOnInit(){
        // set the viewchild modal as the modalelement
        this.modalElement = this.bulkSourceModal;
        // subscribe to know when to show the modal
        this._homeService.showbulkSourceModal.subscribe((show: boolean) => {
            if (show) this.showTheBulkModal();
        });
        this._homeService.setInvalidTable(false);
        this._homeService.validTableVal.subscribe((i:boolean) => {
            this.SinvalidTable = i;
            this._cdRef.detectChanges();
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
        this.ScolHeaders = ['Facility Name *', 'Facility Code *', 'Source Name', 'Source Type *', 'Category Type','Station ID', 'Latitude *', 'Longitude *'];
        this.ScolWidths = [120, 120, 120, 160, 160, 120, 120, 120];
        this.Scolumns = [
            { data: 'facilityName', validator: this.reqValidator}, 
            { data: 'facilityCode', validator: this.facCodeValidator },
            { data: 'name'}, 
            { data: 'sourceTypeID', type: 'autocomplete', source: this.sourceTypeNameArray, strict: true, validator: this.ddValidator}, 
            { data: 'categoryTypeID', type: 'autocomplete', source: this.categoryTypeNameArray, strict: true, validator: this.ddValidator}, 
            { data: 'stationID' },
            { data: 'location.y', type: 'numeric', validator: this.latValidator},//  format: '0,0.00[0000]'},
            { data: 'location.x', type: 'numeric',  validator: this.longValidator},//format: '0,0.00[0000]'}
        ];
        
        this.StableOptions = { 
            columnSorting: true, 
            minSpareRows: 30, 
            rowHeaders: true,
            contextMenu: ['remove_row'],
            manualColumnResize: true, 
            width: 'inherit',
            height: 500,
            outsideClickDeselects: false,
            afterValidate: (isValid, value, row, prop, source) => {
                if (!isValid)  {
                    this.SourceInvalids.push({ "isValid": isValid, "row": row, "prop": prop });
                } else {
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
                } else {
                    this._homeService.setInvalidTable(false);
                    this._cdRef.detectChanges();
                }
            },// end afterValidate
            afterRemoveRow: (index, amount) => {
                //if any $scope.invalids[i].row == index then splice it out
                let selected = this.hotSourceTable.getHandsontableInstance();//.getSelected(); //[startRow, startCol, endRow, endCol]
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
                    for (let Mi = this.SourceInvalids.length; Mi--;) {
                        if (eachRowIndexArray.indexOf(this.SourceInvalids[Mi].row) > -1)
                            this.SourceInvalids.splice(Mi, 1);
                    }
                } else {
                    //just 1 row selected
                    for (let i = this.SourceInvalids.length; i--;) {
                        if (this.SourceInvalids[i].row == index)
                            this.SourceInvalids.splice(i, 1);
                    }
                }
                if (this.SourceInvalids.length > 0) {
                    this._homeService.setInvalidTable(true);
                    this._cdRef.detectChanges();
                }
                else {
                    this._homeService.setInvalidTable(false);
                    this._cdRef.detectChanges();
                }
            }
        };

    } // end ngOnInit()
   
    public iSinvalidTable() {
        return this.SinvalidTable;
    }
    public testValidate(){        
        //let test = this;
        let test = this.hotSourceTable.getHandsontableInstance().validateCells((valid) => {
            let yep = "yes";
        });
    }
    public showTheBulkModal(){
        // open the modal now
        this._modalService.open(this.modalElement, { backdrop: 'static', keyboard: false, size: 'lg'} ).result.then((valid) =>{           
          //  this.CloseResult = `Closed with: ${valid}`;           
            if (valid){
                this._homeService.setbulkSourceModal(false);
            }
        })
    }
    // Validators (TODO) for bulk source table //////////////////////////////////////////////////////////    
    
    private ddValidator(value, callback){
        let row = this['row']; let col = this['col']; // get row and col
        let dataAtRow = this['instance'].getDataAtRow(row); // get this row's data
        let otherDataInRow = false; //flag for if other data exist at this row
        dataAtRow.forEach((d, index) => {
            //need the col too because right after removing req value, it's still in the .getDataAtRow..
            if (d !== null && d !== "" && index !== col)
                otherDataInRow = true;
        });
        let hasError: boolean = false;
        let sourceCol: Array<string> = this['instance'].getSettings().columns[col].source; //get array of sources used for autocomplete        
        if (value !== "" && value !== null) {
            if (sourceCol.map(function (s) { return s; }).indexOf(value) < 0) {
                hasError = true;
            }
            if (hasError) {      
                    
                callback(false);
                let colHeader: string = col == 3 ? this['instance'].getColHeader(col).substring(0, this['instance'].getColHeader(col).length -1) : this['instance'].getColHeader(col);
                alert("This " + colHeader + " is not in the dropdown options.");
                setTimeout(() =>{ this['instance'].deselectCell(); }, 100);  
            }
            else callback(true);
        }  else if (!value && otherDataInRow && col == 3) {
            callback(false)
        } else callback(true);        
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
        
        if (((value < 22 || value > 55) || isNaN(value))  && value !== null) {
            setTimeout(()=> { this['instance'].deselectCell(); }, 100);    
            alert("Latitude must be between 22.0 and 55.0 (dec deg).");                             
            // this._toastService.pop('warning', 'Warning', 'Latitude must be between 22.0 and 55.0 (dec deg)')
            callback(false);
        } else if (!value && otherDataInRow) {            
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
        if (((value < -130 || value > -55) || isNaN(value)) && value !== null) {
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
    
    // validator on facility code starting with 'FC'
    public facCodeValidator(value, callback) {
        let dataAtRow = this['instance'].getDataAtRow(this['row']); // get this row's data
        let otherDataInRow = false; //flag for if other data exist at this row
        dataAtRow.forEach((d, index) => {
            //need the col too because right after removing req value, it's still in the .getDataAtRow..
            if (d !== null && d !== "" && index !== this['col'])
                otherDataInRow = true;
        });
        if (value == "" && otherDataInRow) callback(false);
        else if (/^FC/.test(value)) callback(true);
        else callback(false);        
    }
    // End Validators (TODO) for bulk source table //////////////////////////////////////////////////////////    

    // post sources batch  (NOT WORKING YET)
    public submitTable() {        
        // for each one, add unitTypeID: 1 and pass the regionID
        let pastedSources:Array<ISource> =  Object.assign([], this.sourcedata);
        this.hotSourceTable.getHandsontableInstance().validateCells((valid) => {
            if (valid) { 
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
            } else {
                //not valid
                let infoMessage = "Errors."
                this.infomodal.showInfoModal(infoMessage);
            }
        });
    }    
}