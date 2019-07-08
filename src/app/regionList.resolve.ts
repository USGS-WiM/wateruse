// ------------------------------------------------------------------------------
// ----- regionList.resolve ----------------------------------------------------
// ------------------------------------------------------------------------------

// copyright:   2017 WiM - USGS
// authors:  Tonia Roddick - USGS Wisconsin Internet Mapping
// purpose: resolver to get the category types once logged in

import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { WateruseService } from "app/shared/services/wateruse.service";
import { IRegion } from "app/shared/interfaces/Region.interface";

@Injectable()
export class RegionListResolve implements Resolve<Array<IRegion>> {

  constructor(private _wateruseService: WateruseService) {}

  resolve() {
    return this._wateruseService.getRegions();
  }
}