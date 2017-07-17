// ------------------------------------------------------------------------------
// ----- home.component.ts -----------------------------------------------
// ------------------------------------------------------------------------------

// copyright:   2017 WiM - USGS
// authors:  Tonia Roddick - USGS Wisconsin Internet Mapping
// purpose: main page after login showing selection of region and list of sources for that region

import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import * as Handsontable from 'handsontable';
import { HotTable } from 'ng2-handsontable';

import { WateruseService } from "app/shared/services/wateruse.service";
import { IRegion } from "app/shared/interfaces/Region.interface";
import { ActivatedRoute } from "@angular/router";
import { ISource } from "app/shared/interfaces/Source.interface";
import { HomeService } from "app/home/home.service";
import { AreYouSureModal } from "app/shared/modals/areYouSure.modal";
import { ITimeseries } from "app/shared/interfaces/Timeseries.interface";


@Component({
    moduleId: module.id,
    templateUrl: 'home.component.html'
})

export class HomeComponent implements OnInit {
    @ViewChild('areYouSure') areYouSure: AreYouSureModal;
    @ViewChild(HotTable) hotTable;
    public Fchoice: string;
    public hot: any;
    public invalidTable: boolean;
    public chosenRegionID: number;  // store regionID chosen to use in post/put
    public currentUser: string; // current user logged in right now
    public regionList: Array<IRegion>; // list of regions for user to choose from
    public sourceList: Array<ISource>; // list of sources that returns once they chose a region
    private deleteID: number; // store source id they want to delete
    public errorMessage: string; // not sure how to use this yet
    public timeseriesdata: Array<ITimeseries>; // bulk upload timeseries data
    private colHeaders: Array<string>;
    private columns: Array<any>;
    private colWidths: Array<number>;
    private options: any;
    private invalids: Array<any>;
    
    constructor(private _waterService: WateruseService, private _route: ActivatedRoute, private _homeService: HomeService, private cdRef:ChangeDetectorRef) {
        // get current user from localstorage
        this.currentUser = localStorage.getItem('loggedInName');
    }

    ngOnInit() {
        this.Fchoice = "facilityCode";
        this._homeService.setInvalidTable(false);
        this._homeService.validTableVal.subscribe((t:boolean) => {
            this.invalidTable = t;
        });
        //this.invalidTable = false;
        // instantiate and populate lists
        this.chosenRegionID = -1;
        this.regionList = this._route.snapshot.data['regions'];
        // sources update when user choses region
        this._waterService.sources().subscribe((s: Array<ISource>) => {
            this.sourceList = s;
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
        this.options = { 
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
                    this.cdRef.detectChanges();
                }
                else {
                    this._homeService.setInvalidTable(false);
                    this.cdRef.detectChanges();
                }
            } // end afterValidate
        };
    }

    // region selected, store regionID (e), and go get the sources for this region
    public onRegionSelect(e) {
        this.chosenRegionID = e;
        this._waterService.getSources(e);
    }

    // SOURCE SECTION ///////////////////////////////////////////////////////////
    // source name clicked, show source.modal
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
                regionID: this.chosenRegionID,
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
        this.areYouSure.showSureModal(); // listener is AreYouSureDialogResponse()
        this.deleteID = id;
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
    // END SOURCE SECTION ///////////////////////////////////////////////////////


    // TIMESERIES SECTION ////////////////////////////////////////////////////////////////
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
        this._waterService.postBatchTimeseries(this.chosenRegionID, pastedTimes).subscribe(
            response => {
                let well = response;
            }, error => this.errorMessage = error
        );
            
        
    }
    

    private afterOnCellMouseDown(e: any) {
        console.log(e);
    }
    // END TIMESERIES SECTION ////////////////////////////////////////////////////////////
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
                    this.sourceList.splice(ind, 1); //delete from array
                    this._waterService.setSources(this.sourceList); // update service
                },
                error => this.errorMessage = error
            );
        }
    }

}