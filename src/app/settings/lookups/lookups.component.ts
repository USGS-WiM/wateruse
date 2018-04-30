// ------------------------------------------------------------------------------
// ----- lookups.component.ts -----------------------------------------------
// ------------------------------------------------------------------------------

// copyright:   2017 WiM - USGS
// authors:  Tonia Roddick - USGS Wisconsin Internet Mapping
// purpose: lookups crud in admin settings page

import { Component, OnInit } from '@angular/core';

import { IRegion } from "app/shared/interfaces/Region.interface";
import { ActivatedRoute } from "@angular/router";
import { ISource } from "app/shared/interfaces/Source.interface";
import { ISourceType } from "app/shared/interfaces/SourceType.interface";
import { ICategoryType } from "app/shared/interfaces/Category.interface";
import { IUseType } from "app/shared/interfaces/Use.interface";
import { IUnitType } from "app/shared/interfaces/UnitType.interface";
import { IStatusType } from "app/shared/interfaces/StatusType.interface";
import { IRoles } from "app/shared/interfaces/Roles.interface";

@Component({
    moduleId: module.id,
    templateUrl: 'lookups.component.html',
    styleUrls: ['./lookups.component.css']
})

export class LookupsComponent implements OnInit {
    public sourceTypes: Array<ISourceType>;
    public categoryTypes: Array<ICategoryType>;
    public useTypes: Array<IUseType>;
	public unitTypes: Array<IUnitType>;
    public statusTypes: Array<IStatusType>;
    public roles: Array<IRoles>;
                    
    constructor(private _route: ActivatedRoute){}

    ngOnInit(){
        this._route.data.subscribe((data: { allCategoryTypes: Array<ICategoryType> }) => {
            this.categoryTypes = data.allCategoryTypes;
        });
        this._route.data.subscribe((data: { allUseTypes: Array<IUseType> }) => {
            this.useTypes = data.allUseTypes;
        });
        this._route.data.subscribe((data: { allRoles: Array<IRoles> }) => {
            this.roles = data.allRoles;
        });
        this._route.data.subscribe((data: { allSourceTypes: Array<ISourceType> }) => {
            this.sourceTypes = data.allSourceTypes;
        });
        this._route.data.subscribe((data: { allStatusTypes: Array<IStatusType> }) => {
            this.statusTypes = data.allStatusTypes;
        });
        this._route.data.subscribe((data: { allUnitTypes: Array<IUnitType> }) => {
            this.unitTypes = data.allUnitTypes;
        });              
    }

}
