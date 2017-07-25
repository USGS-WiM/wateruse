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
    @ViewChild('bulkSource') bulkSourceModal;
    //@ViewChild('hotTable') hotSourceTable;    
    public modalReference: any;
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
//    public errorMessage: string;
//    @ViewChild('sourcebulk') sourcebulk: SourceBulkComponent;
    private deleteID: number; // store source id they want to delete
    public errorMessage: string; // not sure how to use this yet
    public Fchoice: string;

    constructor(private _waterService: WateruseService, private _homeService: HomeService, private _toastService: ToasterService, 
        private _modalService: NgbModal, private _cdRef:ChangeDetectorRef) {}
    
    ngOnInit(){   
        this.Fchoice = "facilityCode"; 
        this._waterService.sources().subscribe((s: Array<ISource>) => {
            this.sourceList = s;
        });

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
        this.ScolHeaders = ['Facility Name *', 'Facility Code *', 'Source Name', 'Source Type *', 'Category Type','Station ID', 'Latitude *', 'Longitude *'];
        this.ScolWidths = [120, 120, 120, 160, 160, 120, 120, 120];
        this.Scolumns = [
            { data: 'facilityName', validator: this.reqValidator}, 
            { data: 'facilityCode', validator: this.facCodeValidator },
            { data: 'name'}, 
            { data: 'sourceTypeID', type: 'autocomplete', source: this.sourceTypeNameArray, strict: true}, 
            { data: 'categoryTypeID', type: 'autocomplete', source: this.categoryTypeNameArray, strict: true}, 
            { data: 'stationID' },
            { data: 'location.y', type: 'numeric', format: '0,0.00[0000]'},
            { data: 'location.x', type: 'numeric', format: '0,0.00[0000]'}
        ];
        
        this.StableOptions = { 
            columnSorting: true,             
            minSpareRows: 30, 
            manualColumnResize: true, 
            width: 'inherit',
            height: 500,
            //afterInit: this.setHot,
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
    }
    
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
    private latValidator(value, callback) {
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
    // Done Validators for bulk source table //////////////////////////////////////////////////////////  
  /*  public testValidate(){
        let test = this.hotSourceTable;
        this.hotSourceTable.getHandsontableInstance().validateCells((valid) => {
            let yep = "yes";
        });
}*/
    // post sources batch  (NOT WORKING YET)
    public submitTable(){   
       /* this.hotSourceTable.getHandsontableInstance().validateCells((valid) => {
            if (valid){
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
                
                if (pastedSources.length > 0){
                    this._waterService.postBatchSources(this.regionId, pastedSources).subscribe(
                        response => {
                            this.modalReference.dismiss();
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
            } // end if valid
            else {

            }
        })  */
        
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
                    this._toastService.pop('error', 'Error', 'Source was not deleted.'); 
                    this.errorMessage = error;                    
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
    public showBatchUploadModal(bulkM) {
        this._homeService.setbulkSourceModal(true);
      /*  this.modalReference = this._modalService.open(bulkM, { backdrop: 'static', keyboard: false, size: 'lg'} );
        this.modalReference.result.then((valid) =>{           
          //  this.CloseResult = `Closed with: ${valid}`;           
            if (valid){
//                this._homeService.setbulkSourceModal(false);
            }
        }, (reason) => {
            //this.CloseResult = `Dismissed ${this.getDismissReason(reason)}`
        });*/
    }
    
}