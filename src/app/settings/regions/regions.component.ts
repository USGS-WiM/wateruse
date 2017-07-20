// ------------------------------------------------------------------------------
// ----- regions.component.ts -----------------------------------------------
// ------------------------------------------------------------------------------

// copyright:   2017 WiM - USGS
// authors:  Tonia Roddick - USGS Wisconsin Internet Mapping
// purpose: regions crud in admin settings page

import { Component, OnInit, ViewChild } from '@angular/core';

import { IRegion } from "app/shared/interfaces/Region.interface";
import { ActivatedRoute } from "@angular/router";
import { SettingsService } from "app/settings/settings.service";
import { ToasterService } from "angular2-toaster/angular2-toaster";
import { AreYouSureModal } from "app/shared/modals/areYouSure.modal";

@Component({
    moduleId: module.id,
    templateUrl: 'regions.component.html'
})

export class RegionComponent implements OnInit {
    @ViewChild('areYouSure') areYouSure: AreYouSureModal;
    public regionList: Array<IRegion>;
    private deleteID: number;
    public errorMessage: string;

    constructor(private _route: ActivatedRoute, private _settingsService: SettingsService, private _toastService: ToasterService){}

    ngOnInit(){
        this._route.data.subscribe((data: { allRegions: Array<IRegion> }) => {
            this.regionList = data.allRegions;
            this._settingsService.setRegions(this.regionList);
        });
        // when regions get updated 
        this._settingsService.regions().subscribe((r: Array<IRegion>) => {
            this.regionList = r;
        });
    } // end ngOnInit()

    // source name clicked, show source.modal
    public showRegionModal(r: IRegion) {
        // is this creating new or editing existing?
        if (r !== null) {
            // set the chosen source in the homeService for source.modal to access
            this._settingsService.setModalRegion(r);
        } else {
            //creating new one
            let region: IRegion = {
                name: "",
                description: ""
            }
            this._settingsService.setModalRegion(region);
        }
        // show the modal
        this._settingsService.setRegionModal(true);
    }

    // output emitter from region.modal giving back the region (e) that was either edited or created
    public createEditFinished(e) {
        let ind: number = this.getRegionIndex(e.id);
        // post or put
        if (ind > -1) this.regionList[ind] = e;
        else this.regionList.push(e);
        // update the service sourceList so the home page gets updated with the proper list of sources
        this._settingsService.setRegions(this.regionList);
    }

     // delete the source, show the 'areYouSure' modal
    public deleteRegion(id: number) {
        // show are you sure modal
        this.areYouSure.showSureModal('Are you sure you want to delete this Region?'); // listener is AreYouSureDialogResponse()
        this.deleteID = id;
    }
    // output emitter function when areYouSure is closed
    public AreYouSureDialogResponse(val: boolean) {
        //if they clicked Yes
        if (val) {
            //delete the source
            // get the index to be deleted by the id
            let ind: number = this.getRegionIndex(this.deleteID);
            //delete it
            this._settingsService.deleteEntity(this.deleteID, 'REGIONS_URL').subscribe(
                result => {         
                    this._toastService.pop('success', 'Success', 'Region deleted.');           
                    this.regionList.splice(ind, 1); //delete from array
                    this._settingsService.setRegions(this.regionList); // update service
                },
                error => {
                    this._toastService.pop('error', 'Error', 'Region was not deleted.'); 
                    this.errorMessage = error;                    
                }
            );
        }
    }
    //  get index in regionList based on region.id value
    private getRegionIndex(rID: number): number {
        let ind: number = -1
        this.regionList.some((reg, index, _ary) => {
            if (reg.id === rID) ind = index;
            return reg.id === rID;
        });
        return ind;
    }
        

}
