// ------------------------------------------------------------------------------
// ----- sourcelist.component.ts -----------------------------------------------
// ------------------------------------------------------------------------------

// copyright:   2017 WiM - USGS
// authors:  Tonia Roddick - USGS Wisconsin Internet Mapping
// purpose: selector component for source list (add/edit/delete) tab in home page

import { Component, ViewChild, Output, EventEmitter, Input, ChangeDetectorRef } from '@angular/core';
import { HomeService } from "app/home/home.service";
import { WateruseService } from "app/shared/services/wateruse.service";
import { ToasterService } from "angular2-toaster/angular2-toaster";

import * as Handsontable from 'handsontable';
import { HotTable } from 'ng2-handsontable';

import { InfoModal } from "app/shared/modals/info.modal";
import { ISource } from "app/shared/interfaces/Source.interface";
import { AreYouSureModal } from "app/shared/modals/areYouSure.modal";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ISourceType } from "app/shared/interfaces/SourceType.interface";
import { ICategoryType } from "app/shared/interfaces/Category.interface";

@Component({
  selector: 'sourcelist',
  templateUrl: 'sourcelist.component.html'
})

export class SourceListComponent {
    @Input() regionId: number;  
    @Input() sourceList: Array<ISource>; // list of sources that returns once they chose a region
    @ViewChild('areYouSure') areYouSure: AreYouSureModal;
    @ViewChild('info') infomodal: InfoModal;
    // @ViewChild('bulkSource') bulkSourceModal;
    @ViewChild('hotTable') hotSourceTable;    
    public modalReference: any;
    public sourcedata: Array<ISource> = []; // bulk upload 
    public hot: any;
    public SinvalidTable: boolean;
    private ScolHeaders: Array<string>;
    private Scolumns: Array<any>;
    private ScolWidths: Array<number>;
    private StableOptions: any;
    private SourceInvalids: Array<any>;
    public sourceTypeList: Array<ISourceType>; public sourceTypeNameArray: Array<string>;
    public categoryTypeList: Array<ICategoryType>; public categoryTypeNameArray: Array<string>;
    private deleteID: number; // store source id they want to delete
    public Fchoice: string;
    public showBatch: boolean; // flag to swap list with upload
    private valdTabSub: any;

    constructor(private _waterService: WateruseService, private _homeService: HomeService, private _toastService: ToasterService, 
        private _modalService: NgbModal, private _cdRef:ChangeDetectorRef) {}
    
    ngOnInit(){   
        this.Fchoice = "facilityCode";  this.showBatch = false;
        this._waterService.sources().subscribe((s: Array<ISource>) => {
            this.sourceList = s;
        });
        
        this._homeService.setInvalidTable(false);
        this. valdTabSub = this._homeService.validTableVal.subscribe((i:boolean) => {
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
            { data: 'location.y', type: 'numeric', validator: this.latValidator},
            { data: 'location.x', type: 'numeric', validator: this.longValidator}
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
                } else {
                    this._homeService.setInvalidTable(false);
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
                }
                else {
                    this._homeService.setInvalidTable(false);
                }
            }
        };
    }
    public iSinvalidTable(){
        return this.SinvalidTable;
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
            callback(false);
            alert("Source Type is a required field.")
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
            alert("Longitude is required.");
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
        if ((value == "" || value == null) && otherDataInRow) {
            callback(false); //bad
            alert("Facility Code is required.");
        } else if (!/^FC/.test(value) && otherDataInRow) {
            setTimeout(()=> { this['instance'].deselectCell(); }, 100);
            callback(false); //bad            
            alert("Facility Code must start with 'FC'.");
        } else {
            callback(true); //good
        }
    }
    // Done Validators for bulk source table //////////////////////////////////////////////////////////  
    
    // post sources batch  (NOT WORKING YET)
    public submitTable(){   
       // for each one, add unitTypeID: 1 and pass the regionID
        let pastedSources:Array<ISource> =  Object.assign([], this.sourcedata);
        // LEFT OFF (7/26) with this not applying htInvalid class to the invalid ones
        this.hotSourceTable.getHandsontableInstance().validateCells((valid) => {
            if (valid) { 
                // drop the last 30 since they are empty, TODO swap dropdown name for id
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
                            this.showBatch = false;
                            this._toastService.pop('success', 'Success', 'Sources uploaded.');
                            this.sourcedata = [];
                        }, error => {
                            this._toastService.pop('error', 'Error', error.statusText);
                        });
                } else {
                    let infoMessage = "You must first add sources data before clicking upload."
                    this.infomodal.showInfoModal(infoMessage);
                }        
            } else {
                //not valid
                this._toastService.pop("error", "Error", "Please fix the invalid entries and try again.");
            }
        });
    } 
    // source edit/create clicked, show source.modal
    public showSourceModal(s: ISource) {
        // is this creating new or editing existing?
        if (s !== null) {
            // set the chosen source in the homeService for source.modal to access
            this._homeService.setModalSource(s);
        } else {
            //creating new one
            let source: ISource = {
                facilityName: "",
                facilityCode: "",
                sourceTypeID: 0,
                regionID: this.regionId,
                location: { x: null, y: null, srid: null }
            }
            this._homeService.setModalSource(source);
        }
        // show the modal
        this._homeService.setSourceModal(true);
    }
    // output emitter from source.modal giving back the source (e) that was either edited or created
    public createEditFinished(e) {
        let ind: number = this.getSourceIndex(e.id);
        // post or put
        if (ind > -1) this.sourceList[ind] = e;
        else this.sourceList.push(e);
        // update the service sourceList so the home page gets updated with the proper list of sources
        this._waterService.setSources(this.sourceList);
    }
    // delete the source, show the 'areYouSure' modal
    public deleteSource(id: number) {
        // show are you sure modal
        this.areYouSure.showSureModal('Are you sure you want to delete this Source and all the timeseries associated with it?'); // listener is AreYouSureDialogResponse()
        this.deleteID = id;
    }
    // output emitter function when areYouSure is closed
    public AreYouSureDialogResponse(val: boolean) {
        //if they clicked Yes
        if (val) {
            //delete the source
            // get the index to be deleted by the id
            let ind: number = this.getSourceIndex(this.deleteID);
            //delete it
            this._waterService.deleteSource(this.deleteID).subscribe(
                result => {         
                    this._toastService.pop('success', 'Success', 'Source deleted.');           
                    this.sourceList.splice(ind, 1); //delete from array
                    this._waterService.setSources(this.sourceList); // update service
                },
                error => {
                    this._toastService.pop('error', 'Error', error.statusText); 
                }
            );
        }
    }
    // few lines, to get index in sourceList based on source.id value, used twice above
    private getSourceIndex(sID: number): number {
        let ind: number = -1
        this.sourceList.some((source, index, _ary) => {
            if (source.id === sID) ind = index;
            return source.id === sID;
        });
        return ind;
    }
    public showBatchUpload() {
        this.showBatch = true;
        /* this._homeService.setbulkSourceModal(true);
        this.modalReference = this._modalService.open(bulkM, { backdrop: 'static', keyboard: false, size: 'lg'} );
        this.modalReference.result.then((valid) =>{     
            this.showBatch = false;      
            //  this.CloseResult = `Closed with: ${valid}`;           
            if (valid){
                // this._homeService.setbulkSourceModal(false);
            }
        }, (reason) => {
            this.showBatch = false;  
            //this.CloseResult = `Dismissed ${this.getDismissReason(reason)}`
        });*/
    }
    public dismiss(){
        this.showBatch = false;
        this.sourcedata = []; 
        this.SourceInvalids = [];        
    }
    
    ngOnDestroy() {
        this.valdTabSub.unsubscribe();
        this._cdRef.detach(); // try this
    }
}