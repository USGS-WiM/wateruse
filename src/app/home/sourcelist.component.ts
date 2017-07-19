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

import { InfoModal } from "app/shared/modals/info.modal";
import { ISource } from "app/shared/interfaces/Source.interface";
import { AreYouSureModal } from "app/shared/modals/areYouSure.modal";

@Component({
  selector: 'sourcelist',
  template: `<div  class="margin-top--x3">
                <div class="row bottom-xs">
                    <div class="col-xs-2"><label><span>Filter Sources by:</span></label></div>
                    <div class="col-xs-10 around-xs">
                        <div class="col-xs-3">
                            <label for="facilitycode" class="rdo">  
                    <input type="radio" id="facilitycode" value="facilityCode" name="choice" [(ngModel)]="Fchoice"><span>Facility Code</span>
                </label>
                        </div>
                        <div class="col-xs-3">
                            <label for="facilityName" class="rdo">
                    <input type="radio" id="facilityName" value="facilityName" name="choice" [(ngModel)]="Fchoice"><span>Facility Name</span>
                </label>
                        </div>
                        <div class="col-xs-3">
                            <label for="name" class="rdo">
                    <input type="radio" id="name" value="name" name="choice" [(ngModel)]="Fchoice"><span>Source Name</span>
                </label>
                        </div>
                    </div>
                </div>
                <div class="col-xs-offset-2 col-xs-6">
                    <input type="text" name="Fvalue" [disabled]="Fchoice == undefined || Fchoice == ''" [(ngModel)]="Fvalue" />
                </div>
                <table class="table">
                    <thead>
                        <tr>
                            <th></th><th>Facility Name</th><th>Facility Code</th><th>Source Name</th>
                            <th>Category Type ID</th><th>Source TypeID</th><th>Station ID</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr *ngFor="let s of sourceList | filter: {filterProperty: Fchoice, filterValue: Fvalue} | sort: 'name'">
                            <td>
                                <i title="Create New Source" (click)="showSourceModal(null)" style="cursor:pointer" class="fa fa-plus" aria-hidden="true"></i>&nbsp;
                                <i title="Edit Source" (click)="showSourceModal(s)" style="cursor:pointer" class="fa fa-pencil" aria-hidden="true"></i>&nbsp;
                                <i title="Delete Source" (click)="deleteSource(s.id)" class="fa fa-times" aria-hidden="true" style="cursor:pointer"></i>
                            </td>
                            <td>{{s.facilityName || "---"}}</td><td>{{s.facilityCode || "---"}}</td><td>{{s.name || "---"}}</td>
                            <td>{{s.catagoryTypeID || "---"}}</td><td>{{s.sourceTypeID || "---"}}</td><td>{{s.stationID || "---"}}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <!-- end ngIf=SourceList?Length *ngIf="aSource"-->

            <div *ngIf="sourceList?.length == 0">
                There are no sources for this region.
            </div>
            <areYouSureModal #areYouSure (modalResponseEvent)="AreYouSureDialogResponse($event)"></areYouSureModal>
            <infoModal #info></infoModal>`
})

export class SourceListComponent {
    @Input() regionId: number;  
    @Input() sourceList: Array<ISource>; // list of sources that returns once they chose a region
    @ViewChild('areYouSure') areYouSure: AreYouSureModal;
    private deleteID: number; // store source id they want to delete
    public errorMessage: string; // not sure how to use this yet
    public Fchoice: string;

    constructor(private _waterService: WateruseService, private _homeService: HomeService, private _toastService: ToasterService) {}
    
    ngOnInit(){
        this.Fchoice = "facilityCode"; 
        this._waterService.sources().subscribe((s: Array<ISource>) => {
            this.sourceList = s;
        });
    }
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
}