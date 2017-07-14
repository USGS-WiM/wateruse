// ------------------------------------------------------------------------------
// ----- home.component.ts -----------------------------------------------
// ------------------------------------------------------------------------------

// copyright:   2017 WiM - USGS
// authors:  Tonia Roddick - USGS Wisconsin Internet Mapping
// purpose: main page after login showing selection of region and list of sources for that region

import { Component, OnInit, ViewChild } from '@angular/core';

import { WateruseService } from "app/shared/services/wateruse.service";
import { IRegion } from "app/shared/interfaces/Region.interface";
import { ActivatedRoute } from "@angular/router";
import { ISource } from "app/shared/interfaces/Source.interface";
import { HomeService } from "app/home/home.service";
import { AreYouSureModal } from "app/shared/modals/areYouSure.modal";

@Component({
    moduleId: module.id,
    templateUrl: 'home.component.html'
})

export class HomeComponent implements OnInit {       
	@ViewChild('areYouSure') areYouSure: AreYouSureModal;
    public chosenRegionID: number;  // store regionID chosen to use in post/put
    public currentUser: string; // current user logged in right now
    public regionList: Array<IRegion>; // list of regions for user to choose from
    public sourceList: Array<ISource>; // list of sources that returns once they chose a region
    private deleteID: number; // store source id they want to delete
    public errorMessage: string; // not sure how to use this yet

    constructor(private _waterService: WateruseService, private _route: ActivatedRoute, private _homeService: HomeService) {
        // get current user from localstorage
        this.currentUser = localStorage.getItem('loggedInName');        
    }

    ngOnInit() {
        // instantiate and populate lists
        this.chosenRegionID = -1;
        this.regionList = this._route.snapshot.data['regions'];   
        // sources update when user choses region
        this._waterService.sources().subscribe((s: Array<ISource>) => {
            this.sourceList = s;
        });        
    }

    // region selected, store regionID (e), and go get the sources for this region
    public onRegionSelect(e){
        this.chosenRegionID = e; 
        this._waterService.getSources(e);
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
                regionID: this.chosenRegionID,
                location: {x: null, y: null, srid: null }
            }
            this._homeService.setModalSource(source);
        }
        // show the modal
        this._homeService.setSourceModal(true);
    }

    // output emitter from source.modal giving back the source (e) that was either edited or created
    public createEditFinished(e){
        let ind: number = this.getSourceIndex(e);
/*        this.sourceList.some((source, index, _ary) => {
            if (source.id === e.id) ind = index;
            return source.id === e.id;
        }); */
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
    // output emitter function when areYouSure is closed
    public AreYouSureDialogResponse(val: boolean){
        //if they clicked Yes
		if (val) {
            //delete the source
			// get the index to be deleted by the id
            let ind: number = this.getSourceIndex(this.deleteID);
/*            this.sourceList.some((source, index, _ary) => {
                if (source.id === this.deleteID) ind = index;
                return source.id === this.deleteID;
            }); */
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
    // few lines, to get index in sourceList based on source.id value, used twice above
    private getSourceIndex(sID:number): number {
        let ind: number = -1
        this.sourceList.some((source, index, _ary) => {
            if (source.id === sID) ind = index;
            return source.id === sID;
        });
        return ind;
    }
}