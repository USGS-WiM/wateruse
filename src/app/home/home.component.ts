// ------------------------------------------------------------------------------
// ----- home.component.ts -----------------------------------------------
// ------------------------------------------------------------------------------

// copyright:   2017 WiM - USGS
// authors:  Tonia Roddick - USGS Wisconsin Internet Mapping
// purpose: main page after login showing selection of region and list of sources for that region , ChangeDetectorRef

import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';

import { WateruseService } from "app/shared/services/wateruse.service";
import { IRegion } from "app/shared/interfaces/Region.interface";
import { ActivatedRoute } from "@angular/router";
import { ISource } from "app/shared/interfaces/Source.interface";
import { AreYouSureModal } from "app/shared/modals/areYouSure.modal";
import { NgbTabChangeEvent, NgbTabset } from "@ng-bootstrap/ng-bootstrap";
import { LoadingService } from "app/shared/services/loading.service";
import { ToasterService } from "angular2-toaster/angular2-toaster";

@Component({
    moduleId: module.id,
    templateUrl: 'home.component.html'
})

export class HomeComponent implements OnInit {    
    @ViewChild('areYouSure') areYouSure: AreYouSureModal;    
    @ViewChild('mainTabs') outerTabs: NgbTabset;
    @ViewChild('sourceSubTabs') innerTabs: NgbTabset;

    public chosenRegionID: number;  // store regionID chosen to use in post/put
    public currentUser: string; // current user logged in right now
    public regionList: Array<IRegion>; // list of regions for user to choose from
    public sourceList: Array<ISource>; // list of sources that returns once they chose a region
    public tabChangeEvent: NgbTabChangeEvent;
    public selectedMainTab: string;
    public selectedSubTab: string;
    public nosources: boolean;
    constructor(private _waterService: WateruseService, private _route: ActivatedRoute, private _loadingService: LoadingService, private _toastService: ToasterService) {
        // get current user from localstorage 
        this.currentUser = localStorage.getItem('loggedInName');
    }

    ngOnInit() {
        this.nosources = true;
        this.selectedMainTab = "sources";
        this.selectedSubTab = "sourceList";
        this.chosenRegionID = -1;
        this.regionList = this._route.snapshot.data['regions'];
        // sources update when user choses region
        this._waterService.sources().subscribe((s: Array<ISource>) => {
           this.sourceList = s;
           this.nosources = false;
           this._loadingService.setLoading(false);
        }, error => {
            this._toastService.pop("error", "Error", error.statusText);
        });
    }
   
    // region selected, store regionID (e), and go get the sources for this region
    public onRegionSelect(e) {        
        this._loadingService.setLoading(true);
        this._waterService.getSources(e).subscribe(
                response => {
                    this.chosenRegionID = e;
                    this._waterService.setSources(response);
                    this._loadingService.setLoading(false);
                }, error => { 
                    this._toastService.pop('error', 'Error', 'Error getting Sources: ' + error.statusText);
                    this._loadingService.setLoading(false);
                }
            );
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
        
    // few lines, to get index in sourceList based on source.id value, used twice above
    private getSourceIndex(sID: number): number {
        let ind: number = -1
        this.sourceList.some((source, index, _ary) => {
            if (source.id === sID) ind = index;
            return source.id === sID;
        });
        return ind;
    }
    public beforeMainTabChange(e: NgbTabChangeEvent){
        if (e.activeId == 'timeseries'){
            e.preventDefault();
            this.areYouSure.showSureModal('Are you sure you want to change tabs? You will lose any work done on this tab.'); // listener is AreYouSureDialogResponse()
        }
    }
    // output emitter function when areYouSure is closed
    public AreYouSureDialogResponse(val: boolean) {
        //stop if they hit cancel
        if (val) {
            this.selectedMainTab = "sources";
            this.outerTabs.activeId = this.selectedMainTab;
        }
    }
}