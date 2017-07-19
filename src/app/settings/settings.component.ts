// ------------------------------------------------------------------------------
// ----- regions.component.ts -----------------------------------------------
// ------------------------------------------------------------------------------

// copyright:   2017 WiM - USGS
// authors:  Tonia Roddick - USGS Wisconsin Internet Mapping
// purpose: regions crud in admin settings page

import { Component, OnInit } from '@angular/core';

import { IRegion } from "app/shared/interfaces/Region.interface";
import { ActivatedRoute } from "@angular/router";
import { ISource } from "app/shared/interfaces/Source.interface";
import { ToasterService } from "angular2-toaster/angular2-toaster";

@Component({
    moduleId: module.id,
    templateUrl: 'settings.component.html',
    styleUrls: ['./settings.component.css']
})

export class SettingsComponent implements OnInit {
    constructor(){}

    ngOnInit(){
        
    }

}
