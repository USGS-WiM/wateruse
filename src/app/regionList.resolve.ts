// ------------------------------------------------------------------------------
// ----- regionList.resolve ----------------------------------------------------
// ------------------------------------------------------------------------------

// copyright:   2016 WiM - USGS
//
// authors:  Tonia Roddick USGS Wisconsin Internet Mapping             
//
// purpose: resolver to get the regions once logged in

import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { IRegion } from "app/shared/interfaces/Region.interface";
import { WateruseService } from "app/shared/services/wateruse.service";

@Injectable()
export class RegionListResolve implements Resolve<Array<IRegion>> {

  constructor(private _wateruseService: WateruseService) {}

  resolve() {
    return this._wateruseService.getRegions();
  }
}