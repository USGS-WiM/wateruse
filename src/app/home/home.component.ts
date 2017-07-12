import { Component, OnInit } from '@angular/core';
// import { FormBuilder, FormGroup, Validators, FormControl, FormArray } from '@angular/forms';

import { WateruseService } from "app/shared/services/wateruse.service";
import { IUser } from "app/shared/interfaces/User.interface";
import { IRegion } from "app/shared/interfaces/Region.interface";
import { ActivatedRoute } from "@angular/router";
import { ISource } from "app/shared/interfaces/Source.interface";
import { ISourceType } from "app/shared/interfaces/SourceType.interface";
import { ICategoryType } from "app/shared/interfaces/Category.interface";
import { HomeService } from "app/home/home.service";


@Component({
    moduleId: module.id,
    templateUrl: 'home.component.html'
})

export class HomeComponent implements OnInit {   
    public chosenRegion: number; 
    public Fchoice: string;
    public Fvalue: string;
    public currentUser: string;
    public regionList: Array<IRegion>;
    public sourceList: Array<ISource>;
    public sourceTypeList: Array<ISourceType>;
    public categoryTypeList: Array<ICategoryType>;
   // public aSource: ISource; // if editing source, this is the ngModel
    public sourceTips: any;
    constructor(private _waterService: WateruseService, private _route: ActivatedRoute, private _homeService: HomeService) {
        this.currentUser = localStorage.getItem('loggedInName');        
    }

    ngOnInit() {
        this.chosenRegion = -1;
        this.regionList = this._route.snapshot.data['regions'];   
        // sources update when user choses region
        this._waterService.sources().subscribe((s: Array<ISource>) => {
            this.sourceList = s;
        });        
    }

    // region selected, go get the sources for this region
    public onRegionSelect(e){
        this.chosenRegion = e;
        this._waterService.getSources(e);
    }

    // source name clicked, show details area
    public showSourceModal(s: ISource) {
        if (s !== null) {
            // until location is added....
            s.location = { x: 1, y: 2, srid: 3};
            this._homeService.setModalSource(s);
            this._homeService.setSourceModal(true);
        } else {
            //creating new one
            let source: ISource = {
                name: "",
                facilityName: "",
                facilityCode: "",
                catagoryTypeID: 0,
                sourceTypeID: 0,
                regionID: this.chosenRegion,
                location: {x: null, y: null, srid: null }
            }
            this._homeService.setModalSource(source);
            this._homeService.setSourceModal(true);
        }
    }

    public createEditFinished(e){
        let ind: number;
        this.sourceList.some((source, index, _ary) => {
            if (source.id === e.id) ind = index;
            return source.id === e.id;
        });
        this.sourceList[ind] = e;
        this._waterService.setSources(this.sourceList);
    }

    public deleteSource(s: ISource) {
        // show are you sure modal
    }
    
}